
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import CanAccess from "@/app/components/auth/CanAccess";

import {
  getSesiKonseling,
  getPelanggaranSiswa,
  getKategoriPelanggaran,
} from "@/services/bk.service";

import {
  Search,
  Plus,
  Eye,
  HeartHandshake,
  MessageSquare,
  AlertTriangle,
  Target,
  Clock3,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
} from "lucide-react";

const KONSELING_STATUS = {
  Selesai: {
    className: "theme-success",
    dot: "bg-[var(--color-success)]",
  },
  Terjadwal: {
    className: "theme-info",
    dot: "bg-[var(--color-info)]",
  },
  Dibatalkan: {
    className: "theme-card-soft theme-text-muted",
    dot: "bg-[var(--color-text-muted)]",
  },
};

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "selesai") return "Selesai";
  if (value === "dibatalkan" || value === "ditolak") return "Dibatalkan";

  return "Terjadwal";
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getInitials(nama) {
  return (
    String(nama || "Siswa")
      .split(" ")
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SW"
  );
}

function KonselingStatus({ status }) {
  const config = KONSELING_STATUS[status] || KONSELING_STATUS.Terjadwal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium theme-border ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="theme-card theme-border rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-xs font-medium">{title}</p>

          <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="theme-text-placeholder mt-1 truncate text-xs">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Icon size={19} className="theme-primary-text" />
        </div>
      </div>
    </div>
  );
}

function QuickSummary({ icon: Icon, title, value, description }) {
  return (
    <div className="theme-card theme-border rounded-xl border p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="theme-card-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon size={17} className="theme-text-muted" />
        </div>

        <div className="min-w-0">
          <p className="theme-text-placeholder truncate text-[10px] font-medium">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5">
            <p className="theme-text text-lg font-bold">{value}</p>
            <p className="theme-text-placeholder truncate text-[10px]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  action,
  onAction,
}) {
  return (
    <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
      <div className="theme-border-soft flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Icon size={17} />
          </div>

          <div className="min-w-0">
            <h3 className="theme-text truncate text-sm font-bold">
              {title}
            </h3>

            <p className="theme-text-placeholder truncate text-[10px]">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="theme-sidebar-text-active inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition hover:opacity-80"
        >
          {action}
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="theme-text-muted px-4 py-8 text-center text-xs"
      >
        {children}
      </td>
    </tr>
  );
}

export default function BKPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const [rawKonseling, setRawKonseling] = useState([]);
  const [rawPelanggaran, setRawPelanggaran] = useState([]);
  const [rawKategori, setRawKategori] = useState([]);

  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);

      try {
        const [resK, resP, resKategori] = await Promise.allSettled([
          getSesiKonseling(),
          getPelanggaranSiswa(),
          getKategoriPelanggaran(),
        ]);

        if (!active) return;

        if (resK.status === "fulfilled" && Array.isArray(resK.value)) {
          setRawKonseling(resK.value);
        }

        if (resP.status === "fulfilled" && Array.isArray(resP.value)) {
          setRawPelanggaran(resP.value);
        }

        if (
          resKategori.status === "fulfilled" &&
          Array.isArray(resKategori.value)
        ) {
          setRawKategori(resKategori.value);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const konselingData = useMemo(() => {
    return rawKonseling.map((item) => {
      const namaSiswa = item.siswa?.namaLengkap || "Siswa";

      return {
        id: item.id,
        siswa: namaSiswa,
        nis: item.siswa?.nis || item.siswa?.nisn || "-",
        tanggal: formatTanggal(item.tanggal),
        waktu: item.waktuMulai
          ? item.waktuSelesai
            ? `${item.waktuMulai} - ${item.waktuSelesai}`
            : item.waktuMulai
          : "-",
        konselor: item.konselor?.namaLengkap || "Belum ditentukan",
        kategori: item.topik || "Akademik",
        status: normalizeStatus(item.status),
        avatar: getInitials(namaSiswa),
      };
    });
  }, [rawKonseling]);

  const pelanggaranData = useMemo(() => {
    return rawPelanggaran.map((item) => {
      const namaSiswa = item.siswa?.namaLengkap || "Siswa";

      return {
        id: item.id,
        siswa: namaSiswa,
        nis: item.siswa?.nis || item.siswa?.nisn || "-",
        pelanggaran:
          item.kronologi ||
          item.kategoriPelanggaran?.nama ||
          "-",
        kategori: item.kategoriPelanggaran?.nama || "Tata Tertib",
        point:
          item.poin ??
          item.kategoriPelanggaran?.poin ??
          0,
        tanggal: formatTanggal(item.tanggal),
        status: item.status || "Diproses",
        avatar: getInitials(namaSiswa),
      };
    });
  }, [rawPelanggaran]);

  const filteredKonseling = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();

    return konselingData.filter((item) => {
      const matchesSearch =
        !search ||
        item.siswa.toLowerCase().includes(search) ||
        item.nis.toLowerCase().includes(search) ||
        item.konselor.toLowerCase().includes(search) ||
        item.kategori.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "Semua" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [konselingData, searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredKonseling.length / itemsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedKonseling = filteredKonseling.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const totalPoinPelanggaran = useMemo(() => {
    return pelanggaranData.reduce(
      (total, item) => total + Number(item.point || 0),
      0
    );
  }, [pelanggaranData]);

  const sesiTerjadwal = konselingData.filter(
    (item) => item.status === "Terjadwal"
  ).length;

  const sesiSelesai = konselingData.filter(
    (item) => item.status === "Selesai"
  ).length;

  const kasusAktif = pelanggaranData.filter(
    (item) => String(item.status).toLowerCase() !== "selesai"
  ).length;

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Semua");
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const goToDetailKonseling = (id) => {
    router.push(`/admin/bk/sesi-konseling/${id}`);
  };

  const goToDetailPelanggaran = (id) => {
    router.push(`/admin/bk/pelanggaran/${id}`);
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="bk"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="theme-border shrink-0 border-b">
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

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 px-4 py-6 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <HeartHandshake size={21} />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text text-lg font-bold tracking-tight sm:text-xl">
                    Bimbingan Konseling
                  </h1>

                  <p className="theme-text-secondary text-xs">
                    Pusat monitoring layanan konseling, pelanggaran, dan pembinaan siswa
                  </p>
                </div>
              </div>

              <CanAccess menu="bimbingan konseling" action="create">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/bk/sesi-konseling/tambah")
                  }
                  className="theme-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  <Plus size={17} />
                  Tambah Sesi
                </button>
              </CanAccess>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                title="Sesi Konseling"
                value={loading ? "..." : konselingData.length}
                description="Total sesi tercatat"
                icon={MessageSquare}
                iconBg="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
              />

              <StatCard
                title="Pelanggaran Siswa"
                value={loading ? "..." : pelanggaranData.length}
                description="Total kasus tercatat"
                icon={AlertTriangle}
                iconBg="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
              />

              <StatCard
                title="Kategori Pelanggaran"
                value={loading ? "..." : rawKategori.length}
                description="Kategori terdaftar"
                icon={Target}
                iconBg="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
              />

              <StatCard
                title="Total Poin Pelanggaran"
                value={loading ? "..." : totalPoinPelanggaran}
                description="Akumulasi seluruh poin"
                icon={Award}
                iconBg="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <QuickSummary
                icon={Clock3}
                title="Sesi Terjadwal"
                value={loading ? "..." : sesiTerjadwal}
                description="Sesi"
              />

              <QuickSummary
                icon={CheckCircle2}
                title="Sesi Selesai"
                value={loading ? "..." : sesiSelesai}
                description="Sesi"
              />

              <QuickSummary
                icon={AlertTriangle}
                title="Kasus Aktif"
                value={loading ? "..." : kasusAktif}
                description="Kasus"
              />

              <QuickSummary
                icon={Users}
                title="Kategori Aktif"
                value={
                  loading
                    ? "..."
                    : rawKategori.filter(
                        (item) =>
                          String(item.status || "aktif").toLowerCase() ===
                          "aktif"
                      ).length
                }
                description="Kategori"
              />
            </div>

            <SectionCard
              title="Sesi Konseling Siswa"
              description="Ringkasan jadwal dan riwayat konseling siswa"
              icon={MessageSquare}
              action="Lihat Semua"
              onAction={() =>
                router.push("/admin/bk/sesi-konseling")
              }
            >
              <div className="theme-border-soft flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari nama siswa, NIS, atau konselor..."
                    className="theme-input h-9 w-full rounded-lg border pl-9 pr-3 text-xs outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="theme-input h-9 rounded-lg border px-3 text-xs outline-none"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="theme-card theme-border theme-text-secondary theme-header-hover flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs"
                  >
                    <RotateCcw size={13} />
                    Reset
                  </button>
                </div>
              </div>

              <table className="w-full min-w-[750px] border-collapse">
                <thead className="theme-table-header">
                  <tr className="theme-border border-b">
                    {[
                      "Siswa",
                      "Jadwal",
                      "Konselor",
                      "Topik",
                      "Status",
                      "Aksi",
                    ].map((item) => (
                      <th
                        key={item}
                        className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border-soft)]">
                  {loading ? (
                    <EmptyRow colSpan={6}>
                      Memuat data sesi konseling...
                    </EmptyRow>
                  ) : filteredKonseling.length === 0 ? (
                    <EmptyRow colSpan={6}>
                      Belum ada sesi konseling yang sesuai.
                    </EmptyRow>
                  ) : (
                    paginatedKonseling.map((item) => (
                      <tr
                        key={item.id}
                        className="theme-table-hover transition"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                              {item.avatar}
                            </div>

                            <div className="min-w-0">
                              <p className="theme-text truncate text-xs font-semibold">
                                {item.siswa}
                              </p>
                              <p className="theme-text-muted mt-1 text-[10px]">
                                {item.nis}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="theme-text text-xs font-medium">
                            {item.tanggal}
                          </p>
                          <p className="theme-text-muted mt-1 flex items-center gap-1 text-[10px]">
                            <Clock3 size={11} />
                            {item.waktu}
                          </p>
                        </td>

                        <td className="theme-text-secondary px-4 py-3 text-xs">
                          {item.konselor}
                        </td>

                        <td className="px-4 py-3">
                          <span className="theme-info rounded-md border px-2 py-1 text-[10px] font-medium">
                            {item.kategori}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <KonselingStatus status={item.status} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                goToDetailKonseling(item.id)
                              }
                              title="Lihat detail"
                              className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="theme-border-soft flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs">
                  Menampilkan{" "}
                  <span className="theme-text-secondary font-medium">
                    {filteredKonseling.length === 0
                      ? 0
                      : (safeCurrentPage - 1) * itemsPerPage + 1}
                  </span>
                  {" - "}
                  <span className="theme-text-secondary font-medium">
                    {Math.min(
                      safeCurrentPage * itemsPerPage,
                      filteredKonseling.length
                    )}
                  </span>
                  {" dari "}
                  <span className="theme-text-secondary font-medium">
                    {filteredKonseling.length}
                  </span>{" "}
                  sesi
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="theme-card theme-border theme-text-secondary flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium ${
                        safeCurrentPage === page
                          ? "theme-primary"
                          : "theme-text-muted theme-header-hover"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                    className="theme-card theme-border theme-text-secondary flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Pelanggaran Siswa"
              description="Ringkasan catatan pelanggaran dan poin siswa"
              icon={AlertTriangle}
              action="Lihat Semua"
              onAction={() =>
                router.push("/admin/bk/pelanggaran")
              }
            >
              <table className="w-full min-w-[750px] border-collapse">
                <thead className="theme-table-header">
                  <tr className="theme-border border-b">
                    {[
                      "Siswa",
                      "Pelanggaran",
                      "Kategori",
                      "Poin",
                      "Tanggal",
                      "Aksi",
                    ].map((item) => (
                      <th
                        key={item}
                        className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border-soft)]">
                  {loading ? (
                    <EmptyRow colSpan={6}>
                      Memuat data pelanggaran...
                    </EmptyRow>
                  ) : pelanggaranData.length === 0 ? (
                    <EmptyRow colSpan={6}>
                      Belum ada data pelanggaran siswa.
                    </EmptyRow>
                  ) : (
                    pelanggaranData.slice(0, 5).map((item) => (
                      <tr
                        key={item.id}
                        className="theme-table-hover transition"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                              {item.avatar}
                            </div>

                            <div className="min-w-0">
                              <p className="theme-text truncate text-xs font-semibold">
                                {item.siswa}
                              </p>
                              <p className="theme-text-muted mt-1 text-[10px]">
                                {item.nis}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="theme-text-secondary max-w-[220px] truncate px-4 py-3 text-xs">
                          {item.pelanggaran}
                        </td>

                        <td className="px-4 py-3">
                          <span className="theme-card-soft theme-text-secondary theme-border rounded-md border px-2 py-1 text-[10px]">
                            {item.kategori}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-[var(--color-danger)]">
                            {item.point}
                          </span>
                          <span className="theme-text-muted ml-1 text-[10px]">
                            poin
                          </span>
                        </td>

                        <td className="theme-text-secondary px-4 py-3 text-xs">
                          {item.tanggal}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                goToDetailPelanggaran(item.id)
                              }
                              title="Lihat detail"
                              className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </SectionCard>

            <SectionCard
              title="Kategori & Point Pelanggaran"
              description="Daftar kategori dan ketentuan poin pelanggaran siswa"
              icon={Target}
              action="Lihat Semua"
              onAction={() =>
                router.push("/admin/bk/kategori-pelanggaran")
              }
            >
              <table className="w-full min-w-[650px] border-collapse">
                <thead className="theme-table-header">
                  <tr className="theme-border border-b">
                    {[
                      "No",
                      "Nama Kategori",
                      "Deskripsi",
                      "Point",
                      "Status",
                    ].map((item) => (
                      <th
                        key={item}
                        className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--color-border-soft)]">
                  {loading ? (
                    <EmptyRow colSpan={5}>
                      Memuat kategori pelanggaran...
                    </EmptyRow>
                  ) : rawKategori.length === 0 ? (
                    <EmptyRow colSpan={5}>
                      Belum ada kategori pelanggaran.
                    </EmptyRow>
                  ) : (
                    rawKategori.slice(0, 5).map((item, index) => (
                      <tr
                        key={item.id}
                        className="theme-table-hover transition"
                      >
                        <td className="theme-text-muted px-4 py-3 text-xs">
                          {index + 1}
                        </td>

                        <td className="theme-text px-4 py-3 text-xs font-semibold">
                          {item.nama}
                        </td>

                        <td className="theme-text-secondary max-w-[250px] truncate px-4 py-3 text-xs">
                          {item.deskripsi || "-"}
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-[var(--color-danger)]">
                            {item.poin}
                          </span>
                          <span className="theme-text-muted ml-1 text-[10px]">
                            poin
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md border px-2 py-1 text-[10px] font-medium ${
                              String(item.status || "aktif").toLowerCase() ===
                              "aktif"
                                ? "theme-success"
                                : "theme-card-soft theme-text-muted theme-border"
                            }`}
                          >
                            {item.status || "Aktif"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </SectionCard>

          </div>
        </main>
      </div>
    </div>
  );
}
