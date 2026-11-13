"use client";

import { useEffect, useMemo, useState } from "react";
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
  MapPin,
  LayoutGrid,
  List,
  CheckCircle2,
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

const HARI = [
  { key: "senin", label: "Senin", short: "Sen" },
  { key: "selasa", label: "Selasa", short: "Sel" },
  { key: "rabu", label: "Rabu", short: "Rab" },
  { key: "kamis", label: "Kamis", short: "Kam" },
  { key: "jumat", label: "Jumat", short: "Jum" },
  { key: "sabtu", label: "Sabtu", short: "Sab" },
];

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
  return item?.kelasMapel?.kelas?.nama || item?.kelas?.nama || "-";
}

function getHari(item) {
  return String(item?.hari || "").toLowerCase().trim();
}

function getJam(item) {
  const mulai = item?.jamMulai || "";
  const selesai = item?.jamSelesai || "";

  if (mulai && selesai) return `${mulai}–${selesai}`;
  if (mulai) return mulai;
  if (selesai) return selesai;

  return "";
}

function normalizeHari(hari) {
  const value = String(hari || "").toLowerCase().trim();

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

function getRuanganInfo(item) {
  const relasi = item?.ruanganRef || item?.ruanganData || null;

  const nama =
    relasi?.nama ||
    (typeof item?.ruangan === "string" ? item.ruangan : "") ||
    item?.namaRuangan ||
    "";

  const lokasi = relasi?.lokasi || item?.lokasiRuangan || "";

  return {
    id: item?.ruanganId || relasi?.id || "",
    nama: nama || "-",
    lokasi,
    label: lokasi ? `${nama || "Ruangan"} · ${lokasi}` : nama || "-",
  };
}

function normalizeJadwalData(data) {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    const ruangan = getRuanganInfo(item);

    return {
      id: item?.id || "",
      kelasMapelId: item?.kelasMapelId || item?.kelasMapel?.id || "",
      guruId: item?.kelasMapel?.guruPengajar?.id || item?.guruId || "",
      mapelId:
        item?.kelasMapel?.mataPelajaran?.id || item?.mataPelajaranId || "",
      nama: getNamaGuru(item),
      kode: getKodeGuru(item),
      mapel: getMapel(item),
      kelas: getKelas(item),
      hari: normalizeHari(getHari(item)),
      jamMulai: item?.jamMulai || "",
      jamSelesai: item?.jamSelesai || "",
      ruanganId: ruangan.id,
      ruangan: ruangan.nama,
      lokasiRuangan: ruangan.lokasi,
      ruanganLabel: ruangan.label,
      original: item,
    };
  });
}

const MAPEL_COLOR = [
  {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
    text: "theme-primary-text",
    icon: "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] theme-primary-text",
    line: "bg-[var(--color-primary)]",
  },
];

function getColor(index) {
  return MAPEL_COLOR[index % MAPEL_COLOR.length];
}

export default function JadwalMengajarPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [mapelFilter, setMapelFilter] = useState("Semua Mapel");
  const [selectedHari, setSelectedHari] = useState("senin");

  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [viewMode, setViewMode] = useState("timeline");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getJadwalMengajar();

      if (response?.success === false) {
        throw new Error(
          response?.message || "Gagal mengambil data jadwal mengajar."
        );
      }

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

      setJadwal(normalizeJadwalData(data));
    } catch (err) {
      console.error("[JADWAL] Error:", err);
      setJadwal([]);
      setError(err?.message || "Gagal mengambil data jadwal mengajar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const MAPEL_OPTIONS = useMemo(() => {
    const mapel = jadwal
      .map((item) => item.mapel)
      .filter((value) => value && value !== "-");

    return ["Semua Mapel", ...Array.from(new Set(mapel)).sort()];
  }, [jadwal]);

  const filteredJadwal = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return jadwal.filter((item) => {
      const nama = String(item.nama || "").toLowerCase();
      const kode = String(item.kode || "").toLowerCase();
      const mapel = String(item.mapel || "").toLowerCase();
      const kelas = String(item.kelas || "").toLowerCase();
      const ruangan = String(item.ruangan || "").toLowerCase();
      const lokasi = String(item.lokasiRuangan || "").toLowerCase();

      const matchSearch =
        !keyword ||
        nama.includes(keyword) ||
        kode.includes(keyword) ||
        mapel.includes(keyword) ||
        kelas.includes(keyword) ||
        ruangan.includes(keyword) ||
        lokasi.includes(keyword);

      const matchMapel =
        mapelFilter === "Semua Mapel" || item.mapel === mapelFilter;

      return matchSearch && matchMapel;
    });
  }, [jadwal, search, mapelFilter]);

  const jadwalHariAktif = useMemo(() => {
    return filteredJadwal
      .filter((item) => item.hari === selectedHari)
      .sort((a, b) =>
        String(a.jamMulai || "").localeCompare(String(b.jamMulai || ""))
      );
  }, [filteredJadwal, selectedHari]);

  const totalGuru = useMemo(() => {
    return new Set(
      jadwal.map((item) => item.guruId || item.nama).filter(Boolean)
    ).size;
  }, [jadwal]);

  const totalMapel = useMemo(() => {
    return new Set(jadwal.map((item) => item.mapel).filter(Boolean)).size;
  }, [jadwal]);

  const totalKelas = useMemo(() => {
    return new Set(jadwal.map((item) => item.kelas).filter(Boolean)).size;
  }, [jadwal]);

  const totalSlot = jadwal.length;

  const getDayCount = (day) => {
    return filteredJadwal.filter((item) => item.hari === day).length;
  };

  const handleDelete = async (item) => {
    if (!item?.id) {
      window.alert("ID jadwal tidak ditemukan.");
      return;
    }

    const yakin = window.confirm(
      `Yakin ingin menghapus jadwal ${item.nama} - ${item.mapel} pada ${item.hari}?`
    );

    if (!yakin) return;

    try {
      setDeletingId(item.id);

      const response = await deleteJadwalMengajar(item.id);

      if (response?.success === false) {
        throw new Error(response?.message || "Gagal menghapus jadwal.");
      }

      await fetchJadwal();

      if (selectedHari === item.hari && jadwalHariAktif.length === 1) {
        setSelectedHari("senin");
      }
    } catch (err) {
      console.error("[JADWAL] Delete:", err);
      window.alert(err?.message || "Gagal menghapus jadwal.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (item) => {
    if (!item?.id) {
      window.alert("ID jadwal tidak ditemukan.");
      return;
    }

    router.push(`/admin/guru/jadwal-mengajar/${item.id}/edit`);
  };

  const handleTambah = () => {
    router.push("/admin/guru/jadwal-mengajar/tambah");
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilter = () => {
    setSearch("");
    setMapelFilter("Semua Mapel");
    setSelectedHari("senin");
  };

  return (
    <div className="theme-page theme-text flex h-screen w-full overflow-hidden">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="guruJadwalMengajar"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="w-full space-y-6">
              <section className="theme-card theme-border relative overflow-hidden rounded-[24px] border shadow-sm">
                <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[var(--color-primary)]/5 blur-sm" />
                <div className="absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-[var(--color-primary)]/5" />
                <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-[var(--color-primary)]/5 blur-2xl" />

                <div className="relative p-5 sm:p-7 lg:p-8">
                  <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] theme-primary-text mb-4 inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5">
                        <CalendarClock size={14} />
                        <span className="theme-text-secondary text-[10px] font-bold uppercase tracking-[0.12em]">
                          Akademik
                        </span>
                      </div>

                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl lg:text-[34px]">
                        Jadwal Mengajar
                      </h1>

                      <p className="theme-text-secondary mt-2 max-w-xl text-sm leading-relaxed">
                        Kelola jadwal mengajar guru, mata pelajaran, kelas,
                        waktu, dan ruangan dalam satu tampilan yang lebih
                        terstruktur.
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <div className="theme-card-soft theme-border inline-flex items-center gap-2 rounded-xl border px-3 py-2">
                          <CalendarDays
                            size={14}
                            className="text-[var(--color-primary)]"
                          />
                          <span className="theme-text-secondary text-xs font-medium">
                            Tahun Ajaran 2026/2027
                          </span>
                        </div>

                        <div className="theme-card-soft theme-border inline-flex items-center gap-2 rounded-xl border px-3 py-2">
                          <BookMarked
                            size={14}
                            className="text-[var(--color-primary)]"
                          />
                          <span className="theme-text-secondary text-xs font-medium">
                            Semester Ganjil
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:min-w-[190px] lg:flex-col">
                      <button
                        type="button"
                        onClick={handleTambah}
                        className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all"
                      >
                        <Plus size={17} />
                        Tambah Jadwal
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="theme-card-soft theme-border theme-text-secondary theme-sidebar-hover inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all"
                      >
                        <Printer size={16} />
                        Cetak Jadwal
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4 kartu: 1 kolom (mobile) -> 2 kolom (sm) -> 4 kolom (lg ke atas, penuh) */}
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <PremiumStat
                  icon={Users}
                  title="Guru Mengajar"
                  value={totalGuru}
                  description="Guru terjadwal"
                  numberClass="text-[var(--color-primary)]"
                  iconClass="theme-primary-text"
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
                  numberClass="theme-text"
                  iconClass="theme-primary-text"
                />

                <PremiumStat
                  icon={Clock3}
                  title="Slot Mingguan"
                  value={totalSlot}
                  description="Total jadwal"
                  numberClass="theme-text"
                  iconClass="theme-primary-text"
                />
              </section>

              <section className="theme-card theme-border rounded-2xl border p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari guru, NIP, mapel, kelas, atau ruangan..."
                      className="theme-input w-full rounded-xl border py-3 pl-10 pr-10 text-sm transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2 hover:text-[var(--color-text)]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter
                      size={15}
                      className="theme-text-muted hidden sm:block"
                    />

                    <select
                      value={mapelFilter}
                      onChange={(e) => setMapelFilter(e.target.value)}
                      className="theme-input w-full min-w-[190px] rounded-xl border px-3 py-3 text-xs font-semibold focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 sm:w-auto"
                    >
                      {MAPEL_OPTIONS.map((mapel) => (
                        <option key={mapel} value={mapel}>
                          {mapel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="theme-card-soft flex items-center gap-1 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("timeline")}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:flex-none ${
                        viewMode === "timeline"
                          ? "theme-card text-[var(--color-primary)] shadow-sm"
                          : "theme-text-muted theme-sidebar-hover"
                      }`}
                    >
                      <LayoutGrid size={14} />
                      Jadwal
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("table")}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:flex-none ${
                        viewMode === "table"
                          ? "theme-card text-[var(--color-primary)] shadow-sm"
                          : "theme-text-muted theme-sidebar-hover"
                      }`}
                    >
                      <List size={14} />
                      Tabel
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={resetFilter}
                    className="theme-border theme-card theme-text-secondary theme-sidebar-hover inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition-all"
                  >
                    <RefreshCw size={14} />
                    Reset
                  </button>
                </div>
              </section>

              {error && (
                <div className="theme-danger theme-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-danger)]">
                      Gagal mengambil data jadwal
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-danger)]">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchJadwal}
                    className="theme-card theme-border theme-sidebar-hover inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold theme-text-secondary hover:text-[var(--color-primary)]"
                  >
                    <RefreshCw size={13} />
                    Coba Lagi
                  </button>
                </div>
              )}

              {loading && <LoadingState />}

              {!loading && viewMode === "timeline" && (
                <section className="space-y-4">
                  <div className="theme-card theme-border rounded-2xl border p-3 shadow-sm">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {HARI.map((day) => {
                        const count = getDayCount(day.key);
                        const active = selectedHari === day.key;

                        return (
                          <button
                            type="button"
                            key={day.key}
                            onClick={() => setSelectedHari(day.key)}
                            className={`relative rounded-xl p-3 text-left transition-all duration-200 ${
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
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                  active
                                    ? "theme-card text-[var(--color-primary)]"
                                    : "theme-card theme-text-placeholder"
                                }`}
                              >
                                {count}
                              </span>
                            </div>

                            <p
                              className={`mt-1 text-[10px] ${
                                active
                                  ? "opacity-80"
                                  : "theme-text-placeholder"
                              }`}
                            >
                              {count === 0
                                ? "Kosong"
                                : count === 1
                                  ? "1 jadwal"
                                  : `${count} jadwal`}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-border-soft flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                            <CalendarDays
                              size={15}
                              className="text-[var(--color-primary)]"
                            />
                          </div>

                          <div>
                            <h2 className="theme-text text-sm font-bold">
                              Jadwal Hari{" "}
                              {HARI.find((day) => day.key === selectedHari)
                                ?.label || ""}
                            </h2>

                            <p className="theme-text-muted mt-0.5 text-[10px]">
                              Daftar sesi pembelajaran hari ini
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="theme-success inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold">
                          <CheckCircle2 size={12} />
                          {jadwalHariAktif.length} sesi
                        </span>
                      </div>
                    </div>

                    {jadwalHariAktif.length > 0 ? (
                      <div className="p-4 sm:p-6">
                        <div className="relative">
                          <div className="absolute bottom-5 left-[55px] top-5 w-px bg-[var(--color-border)] sm:left-[75px]" />

                          <div className="space-y-3">
                            {jadwalHariAktif.map((item, index) => (
                              <TimelineItem
                                key={item.id}
                                item={item}
                                index={index}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                deletingId={deletingId}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyState onTambah={handleTambah} />
                    )}
                  </div>
                </section>
              )}

              {!loading && viewMode === "table" && (
                <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                  <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4">
                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Data Jadwal Mengajar
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-[10px]">
                        {filteredJadwal.length} jadwal ditemukan
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="theme-border theme-text-secondary theme-sidebar-hover inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                    >
                      <Printer size={14} />
                      Cetak
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                      <thead>
                        <tr className="theme-table-header theme-border border-b">
                          {[
                            "No",
                            "Guru",
                            "Mata Pelajaran",
                            "Kelas",
                            "Hari",
                            "Jam",
                            "Ruangan",
                            "Aksi",
                          ].map((label) => (
                            <th
                              key={label}
                              className={`theme-text-muted px-5 py-3 text-[10px] font-bold uppercase tracking-wide ${
                                label === "Aksi" ? "text-center" : "text-left"
                              }`}
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {filteredJadwal.map((item, index) => {
                          const color = getColor(index);

                          return (
                            <tr
                              key={item.id}
                              className="theme-border-soft theme-table-hover border-b transition-colors"
                            >
                              <td className="theme-text-muted px-5 py-4 text-xs font-semibold">
                                {String(index + 1).padStart(2, "0")}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                                    <UserRound size={15} />
                                  </div>

                                  <div>
                                    <p className="theme-text text-xs font-bold">
                                      {item.nama}
                                    </p>
                                    <p className="theme-text-placeholder mt-0.5 text-[10px]">
                                      {item.kode}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center rounded-lg px-2.5 py-1.5 ${color.bg} ${color.text} text-[10px] font-bold`}
                                >
                                  {item.mapel}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="theme-text-secondary inline-flex items-center gap-1.5 text-xs font-semibold">
                                  <School
                                    size={13}
                                    className="theme-text-muted"
                                  />
                                  {item.kelas}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-xs font-semibold capitalize text-[var(--color-primary)]">
                                  {item.hari}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="theme-text-secondary inline-flex items-center gap-1.5 text-xs font-semibold">
                                  <Clock3
                                    size={13}
                                    className="text-[var(--color-primary)]"
                                  />
                                  {getJam(item) || "-"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="theme-text-muted flex items-start gap-1.5 text-xs">
                                  <MapPin
                                    size={13}
                                    className="mt-0.5 shrink-0"
                                  />
                                  <div>
                                    <p className="theme-text-secondary font-semibold">
                                      {item.ruangan}
                                    </p>

                                    {item.lokasiRuangan && (
                                      <p className="mt-0.5 text-[10px]">
                                        {item.lokasiRuangan}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(item)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.id}
                                    className="theme-danger flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-80 disabled:opacity-50"
                                    title="Hapus"
                                  >
                                    {deletingId === item.id ? (
                                      <RefreshCw
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredJadwal.length === 0 && (
                    <EmptyState onTambah={handleTambah} />
                  )}
                </section>
              )}

              {!loading && filteredJadwal.length > 0 && (
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-5">
                    <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--color-primary)]/5" />

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <Sparkles
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <p className="theme-text text-sm font-semibold">
                          Jadwal terorganisir
                        </p>

                        <p className="theme-text-muted mt-1 text-[11px]">
                          Terdapat{" "}
                          <span className="theme-text font-bold">
                            {filteredJadwal.length} jadwal
                          </span>{" "}
                          yang sesuai dengan filter saat ini.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="theme-card theme-border flex items-center gap-3 rounded-2xl border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>
                      <p className="theme-text-placeholder text-[10px]">
                        Status Sistem
                      </p>

                      <p className="theme-text-secondary mt-0.5 text-xs font-bold">
                        Data tersinkron
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <div className="flex flex-col gap-2 px-1 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-placeholder text-[10px]">
                  SmartSchool • Akademik • Jadwal Mengajar
                </p>

                <div className="theme-text-placeholder flex items-center gap-1.5 text-[10px]">
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

function PremiumStat({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
  numberClass,
}) {
  return (
    <div className="theme-card theme-border group min-w-0 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-placeholder text-[10px] font-semibold sm:text-[11px]">
            {title}
          </p>

          <p className={`mt-2 text-2xl font-bold sm:text-[28px] ${numberClass}`}>
            {value}
          </p>

          <p className="theme-text-muted mt-1 text-[10px]">{description}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item, index, onEdit, onDelete, deletingId }) {
  const color = getColor(index);

  return (
    <div className="relative grid grid-cols-[50px_1fr] items-start gap-3 sm:grid-cols-[75px_1fr] sm:gap-5">
      <div className="z-10 bg-[var(--color-card)] pt-4 pr-1 text-right sm:pr-2">
        <p className="theme-text-secondary text-xs font-bold sm:text-sm">
          {item.jamMulai || "--:--"}
        </p>

        <p className="theme-text-placeholder mt-0.5 text-[9px] sm:text-[10px]">
          {item.jamSelesai || "--:--"}
        </p>
      </div>

      <div className="absolute left-[55px] top-[22px] z-20 -translate-x-1/2 sm:left-[75px]">
        <div
          className={`h-3 w-3 rounded-full border-[3px] border-[var(--color-card)] shadow-sm ${color.line}`}
        />
      </div>

      <div
        className={`group relative overflow-hidden rounded-xl border ${color.border} ${color.bg} p-4 transition-all duration-200 hover:shadow-md sm:p-5`}
      >
        <div className={`absolute bottom-0 left-0 top-0 w-1 ${color.line}`} />

        <div className="pl-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 theme-card ${color.text} text-[9px] font-bold uppercase tracking-wide`}
                >
                  {item.mapel}
                </span>

                <span className="theme-card theme-text-muted rounded-md px-2 py-1 text-[9px] font-semibold">
                  {item.kelas}
                </span>
              </div>

              <h3 className="theme-text mt-2 text-sm font-bold sm:text-base">
                {item.mapel}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="theme-text-muted inline-flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                  <UserRound size={12} />
                  {item.nama}
                </span>

                <span className="theme-text-muted inline-flex items-center gap-1.5 text-[10px] sm:text-[11px]">
                  <MapPin size={12} />
                  {item.ruangan || "Ruangan belum ditentukan"}
                </span>

                {item.lokasiRuangan && (
                  <span className="theme-text-placeholder text-[10px] sm:text-[11px]">
                    {item.lokasiRuangan}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="theme-card theme-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:text-[var(--color-primary)]"
                title="Edit"
              >
                <Pencil size={13} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={deletingId === item.id}
                className="theme-card theme-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:text-[var(--color-danger)] disabled:opacity-50"
                title="Hapus"
              >
                {deletingId === item.id ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            </div>
          </div>

          <div className="theme-border mt-4 flex flex-wrap items-center gap-3 border-t pt-3">
            <span className="theme-text-muted inline-flex items-center gap-1.5 text-[10px] font-semibold">
              <Clock3 size={11} />
              {getJam(item) || "-"}
            </span>

            <span className="theme-text-muted inline-flex items-center gap-1.5 text-[10px] font-semibold">
              <School size={11} />
              Kelas {item.kelas}
            </span>

            {item.kode && item.kode !== "-" && (
              <span className="theme-text-placeholder inline-flex items-center gap-1.5 font-mono text-[10px]">
                NIP {item.kode}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onTambah }) {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
        <CalendarClock size={25} className="text-[var(--color-primary)]" />
      </div>

      <h3 className="theme-text-secondary mt-4 text-sm font-bold">
        Belum ada jadwal
      </h3>

      <p className="theme-text-muted mx-auto mt-1.5 max-w-sm text-xs leading-relaxed">
        Tidak ada jadwal mengajar yang sesuai dengan filter yang dipilih.
      </p>

      <button
        type="button"
        onClick={onTambah}
        className="theme-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-all"
      >
        <Plus size={14} />
        Tambah Jadwal
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="theme-card theme-border rounded-2xl border p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <RefreshCw
            size={22}
            className="animate-spin text-[var(--color-primary)]"
          />
        </div>

        <p className="theme-text-secondary mt-4 text-sm font-semibold">
          Memuat jadwal...
        </p>

        <p className="theme-text-muted mt-1 text-[11px]">
          Mengambil data jadwal mengajar dari server
        </p>
      </div>
    </div>
  );
}