"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getSesiKonseling,
  deleteSesiKonseling,
  putuskanPengajuanKonseling,
} from "@/services/bk.service";


export default function SesiKonselingPage() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [sortBy, setSortBy] = useState("tanggal_desc");
  const [page, setPage] = useState(1);

  const perPage = 7;


  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      setError("");

      const result = await getSesiKonseling();

      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err?.message || "Gagal mengambil data sesi konseling."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      setSuccess("");

      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  }


 
  const handleDecision = async (id, keputusan, catatan = "") => {
    try {
      setProcessingId(id);
      setError("");
      await putuskanPengajuanKonseling(id, {
        keputusan,
        ...(keputusan === "tolak" && catatan.trim()
          ? { catatan: catatan.trim() }
          : {}),
      });

      setSuccess(
        `Pengajuan konseling berhasil ${keputusan === "setujui" ? "disetujui" : "ditolak"}.`
      );
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectNote("");
      loadData(false);
    } catch (err) {
      console.error("Gagal memproses keputusan konseling:", err);
      setError(err?.message || "Gagal memproses keputusan konseling.");
    } finally {
      setProcessingId(null);
    }
  };


  function getNamaSiswa(item) {
    return (
      item?.siswa?.namaLengkap ||
      item?.namaSiswa ||
      item?.siswaId ||
      "Siswa"
    );
  }

  function getNamaKonselor(item) {
    return (
      item?.konselor?.namaLengkap ||
      item?.namaKonselor ||
      item?.guruBK?.namaLengkap ||
      item?.konselorId ||
      "Belum ditentukan"
    );
  }

  function getNis(item) {
    return item?.siswa?.nis || item?.nis || "";
  }

  function getWaktu(item) {
    const mulai = item?.waktuMulai;
    const selesai = item?.waktuSelesai;

    if (mulai && selesai) {
      return `${mulai} - ${selesai}`;
    }

    return mulai || selesai || "-";
  }

  function formatTanggal(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function initials(name) {
    if (!name || typeof name !== "string") return "?";

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return "?";

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }


  function statusLabel(status) {
    const map = {
      diajukan: "Menunggu Persetujuan",
      dijadwalkan: "Dijadwalkan",
      ditolak: "Ditolak",
      dibatalkan: "Dibatalkan",
    };

    return map[status] || status || "-";
  }

  function statusClass(status) {
    if (status === "dijadwalkan") {
      return "theme-success";
    }

    if (status === "ditolak" || status === "dibatalkan") {
      return "theme-danger";
    }

    if (status === "diajukan") {
      return "theme-warning";
    }

    return "theme-info";
  }


  const stats = useMemo(
    () => ({
      total: data.length,
      diajukan: data.filter(
        (item) => item.status === "diajukan"
      ).length,
      dijadwalkan: data.filter(
        (item) => item.status === "dijadwalkan"
      ).length,
      ditolak: data.filter(
        (item) => item.status === "ditolak"
      ).length,
      dibatalkan: data.filter(
        (item) => item.status === "dibatalkan"
      ).length,
    }),
    [data]
  );


  const filteredData = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id");

    const filtered = data.filter((item) => {
      const namaSiswa = getNamaSiswa(item).toLocaleLowerCase("id");
      const namaKonselor = getNamaKonselor(item).toLocaleLowerCase("id");
      const topik = String(item?.topik || "").toLocaleLowerCase("id");
      const masalah = String(item?.masalah || "").toLocaleLowerCase("id");

      const cocokSearch =
        !keyword ||
        namaSiswa.includes(keyword) ||
        namaKonselor.includes(keyword) ||
        topik.includes(keyword) ||
        masalah.includes(keyword);

      const cocokStatus =
        statusFilter === "semua" ||
        item?.status === statusFilter;

      return cocokSearch && cocokStatus;
    });

    const sorted = [...filtered];

    const getTime = (item) => {
      if (!item?.tanggal) return 0;

      const timestamp = new Date(item.tanggal).getTime();

      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    const compareNama = (a, b) =>
      getNamaSiswa(a).localeCompare(getNamaSiswa(b), "id");

    if (sortBy === "tanggal_asc") {
      sorted.sort((a, b) => getTime(a) - getTime(b));
    } else if (sortBy === "tanggal_desc") {
      sorted.sort((a, b) => getTime(b) - getTime(a));
    } else if (sortBy === "nama_asc") {
      sorted.sort(compareNama);
    } else if (sortBy === "nama_desc") {
      sorted.sort((a, b) => compareNama(b, a));
    }

    return sorted;
  }, [data, search, statusFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sortBy]);

  const totalPage = Math.max(
    1,
    Math.ceil(filteredData.length / perPage)
  );

  const currentPage = Math.min(page, totalPage);
  const startIndex = (currentPage - 1) * perPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + perPage
  );


  async function handleDelete(item) {
    const id = item?.id;

    if (!id) {
      setError("ID sesi konseling tidak ditemukan.");
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus sesi konseling milik ${getNamaSiswa(item)}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deleteSesiKonseling(id);

      setSuccess("Sesi konseling berhasil dihapus.");
      await loadData(false);
    } catch (err) {
      setError(
        err?.message || "Gagal menghapus sesi konseling."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilter() {
    setSearch("");
    setStatusFilter("semua");
    setSortBy("tanggal_desc");
    setPage(1);
  }


  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="guru" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-current/10">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="theme-text text-2xl font-bold tracking-tight">
                    Sesi Konseling
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Kelola pengajuan dan jadwal konseling siswa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="theme-card theme-text-secondary theme-header-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M19.419 15H15"
                  />
                </svg>

                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="theme-danger mb-4 rounded-lg border px-4 py-3 text-sm font-semibold"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="theme-success mb-4 rounded-lg border px-4 py-3 text-sm font-semibold"
              >
                {success}
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Stat
                label="Total Sesi"
                value={stats.total}
                subtitle="Seluruh sesi konseling"
                icon="chat"
                tone="blue"
              />

              <Stat
                label="Menunggu"
                value={stats.diajukan}
                subtitle="Perlu ditinjau"
                icon="clock"
                tone="amber"
              />

              <Stat
                label="Dijadwalkan"
                value={stats.dijadwalkan}
                subtitle="Pengajuan disetujui"
                icon="calendar"
                tone="sky"
              />

              <Stat
                label="Ditolak"
                value={stats.ditolak}
                subtitle="Pengajuan tidak disetujui"
                icon="x"
                tone="red"
              />

              <Stat
                label="Dibatalkan"
                value={stats.dibatalkan}
                subtitle="Sesi dibatalkan"
                icon="ban"
                tone="red"
              />
            </div>

            <section className="theme-card mb-5 rounded-xl border p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:flex-1">
                  <svg
                    className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>

                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari siswa, konselor, atau topik..."
                    className="theme-input w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm font-medium outline-none transition focus:border-[var(--color-primary)]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter status"
                  className="theme-input rounded-lg border px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-[var(--color-primary)]"
                >
                  <option value="semua">Semua Status</option>
                  <option value="diajukan">Menunggu Persetujuan</option>
                  <option value="dijadwalkan">Dijadwalkan</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>

                <div className="relative">
                  <svg
                    className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Urutkan data"
                    className="theme-input w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm font-semibold outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="tanggal_desc">Tanggal Terbaru</option>
                    <option value="tanggal_asc">Tanggal Terlama</option>
                    <option value="nama_asc">Nama Siswa A - Z</option>
                    <option value="nama_desc">Nama Siswa Z - A</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="theme-card theme-text-secondary theme-header-hover inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M19.419 15H15"
                    />
                  </svg>
                  Reset
                </button>
              </div>

              <div className="theme-border-soft mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                <span className="theme-text-muted text-xs font-medium">
                  Hasil pencarian:
                </span>

                <span className="theme-info rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-current/10">
                  {filteredData.length} sesi
                </span>

                {statusFilter !== "semua" && (
                  <span className="theme-text-secondary rounded-full border px-2.5 py-1 text-xs font-semibold">
                    {statusLabel(statusFilter)}
                  </span>
                )}
              </div>
            </section>

            <section className="theme-card overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="theme-table-header border-b">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Konselor
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Jadwal
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Topik
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <div className="theme-text-muted flex items-center justify-center gap-2 text-sm font-medium">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Memuat data sesi konseling...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="theme-text-muted px-5 py-14 text-center"
                        >
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="theme-card mb-3 flex h-12 w-12 items-center justify-center rounded-xl border">
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                            </div>

                            <p className="theme-text text-sm font-bold">
                              Tidak ada sesi konseling
                            </p>

                            <p className="mt-1 text-xs">
                              Data tidak ditemukan atau belum ada pengajuan
                              yang sesuai dengan filter.
                            </p>

                            {(search || statusFilter !== "semua") && (
                              <button
                                type="button"
                                onClick={resetFilter}
                                className="theme-text mt-3 text-sm font-bold underline underline-offset-4"
                              >
                                Hapus filter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr
                          key={item.id}
                          className="theme-table-hover border-b last:border-b-0 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-current/10">
                                {initials(getNamaSiswa(item))}
                              </div>

                              <div className="min-w-0">
                                <div className="theme-text max-w-[200px] truncate text-sm font-bold">
                                  {getNamaSiswa(item)}
                                </div>

                                <div className="theme-text-muted mt-1 text-xs font-medium">
                                  {getNis(item)
                                    ? `NIS ${getNis(item)}`
                                    : "NIS tidak tersedia"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="theme-text-secondary px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m6-10a4 4 0 100-8 4 4 0 000 8zm10 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                  />
                                </svg>
                              </div>

                              <span className="max-w-[180px] truncate text-sm font-semibold">
                                {getNamaKonselor(item)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="theme-text-secondary text-sm font-semibold">
                              {formatTanggal(item.tanggal)}
                            </div>

                            <div className="theme-text-muted mt-1 flex items-center gap-1.5 text-xs font-medium">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="12" r="9" />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 7v5l3 2"
                                />
                              </svg>
                              {getWaktu(item)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="theme-text-secondary max-w-[220px] truncate text-sm font-semibold">
                              {item.topik || "-"}
                            </div>

                            {item.masalah && (
                              <div className="theme-text-muted mt-1 max-w-[220px] truncate text-xs">
                                {item.masalah}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(
                                item.status
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {statusLabel(item.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {item.status === "diajukan" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDecision(item.id, "setujui")
                                    }
                                    disabled={processingId !== null}
                                    title="Setujui pengajuan"
                                    className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {processingId === item.id
                                      ? "Memproses..."
                                      : "Setujui"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectTarget(item);
                                      setRejectNote("");
                                      setError("");
                                      setShowRejectModal(true);
                                    }}
                                    disabled={processingId !== null}
                                    title="Tolak pengajuan"
                                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Tolak
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/bk/sesi-konseling/${item.id}`
                                  )
                                }
                                title="Lihat detail"
                                aria-label={`Lihat detail sesi ${getNamaSiswa(item)}`}
                                className="theme-text-muted theme-header-hover rounded-lg p-2 transition"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/bk/sesi-konseling/${item.id}/edit`
                                  )
                                }
                                title="Edit sesi"
                                aria-label={`Edit sesi ${getNamaSiswa(item)}`}
                                className="theme-text-muted rounded-lg p-2 transition hover:bg-[var(--color-info-background)] hover:text-[var(--color-info)]"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                  />
                                </svg>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                disabled={
                                  deletingId === item.id ||
                                  processingId !== null
                                }
                                title="Hapus sesi"
                                aria-label={`Hapus sesi ${getNamaSiswa(item)}`}
                                className="theme-text-muted rounded-lg p-2 transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {deletingId === item.id ? (
                                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && filteredData.length > 0 && (
                <div className="theme-card flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">
                  <p className="theme-text-secondary text-sm font-medium">
                    Menampilkan{" "}
                    <span className="theme-text font-bold">
                      {startIndex + 1} -{" "}
                      {Math.min(
                        startIndex + perPage,
                        filteredData.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text font-bold">
                      {filteredData.length}
                    </span>{" "}
                    data
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Halaman sebelumnya"
                      className="theme-card theme-text-secondary theme-header-hover flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: totalPage }).map((_, i) => {
                      const p = i + 1;
                      const active = p === currentPage;

                      if (
                        totalPage > 7 &&
                        p !== 1 &&
                        p !== totalPage &&
                        Math.abs(p - currentPage) > 1
                      ) {
                        if (p === 2 && currentPage > 3) {
                          return (
                            <span
                              key={p}
                              className="theme-text-muted px-1"
                            >
                              …
                            </span>
                          );
                        }

                        if (
                          p === totalPage - 1 &&
                          currentPage < totalPage - 2
                        ) {
                          return (
                            <span
                              key={p}
                              className="theme-text-muted px-1"
                            >
                              …
                            </span>
                          );
                        }

                        return null;
                      }

                      return (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setPage(p)}
                          aria-current={active ? "page" : undefined}
                          className={
                            active
                              ? "theme-primary flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-bold shadow-sm transition"
                              : "theme-card theme-text-secondary theme-header-hover flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-bold transition"
                          }
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) => Math.min(totalPage, p + 1))
                      }
                      disabled={currentPage === totalPage}
                      aria-label="Halaman berikutnya"
                      className="theme-card theme-text-secondary theme-header-hover flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {showRejectModal && rejectTarget && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    setShowRejectModal(false);
                    setRejectTarget(null);
                    setRejectNote("");
                  }
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="reject-modal-title"
                  className="theme-card w-full max-w-md rounded-xl border p-5 shadow-xl"
                >
                  <h2
                    id="reject-modal-title"
                    className="theme-text text-lg font-bold"
                  >
                    Tolak Pengajuan Konseling
                  </h2>

                  <p className="theme-text-muted mt-2 text-sm">
                    Masukkan alasan penolakan agar siswa mengetahui alasan
                    pengajuannya ditolak.
                  </p>

                  <label
                    htmlFor="reject-note"
                    className="theme-text mt-4 block text-sm font-semibold"
                  >
                    Alasan penolakan
                  </label>

                  <textarea
                    id="reject-note"
                    value={rejectNote}
                    onChange={(event) => setRejectNote(event.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Tuliskan alasan penolakan..."
                    className="theme-input mt-2 w-full rounded-lg border p-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    required
                  />

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectTarget(null);
                        setRejectNote("");
                      }}
                      disabled={processingId !== null}
                      className="theme-card theme-text-secondary rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      disabled={!rejectNote.trim() || processingId !== null}
                      onClick={() =>
                        handleDecision(
                          rejectTarget.id,
                          "tolak",
                          rejectNote
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingId === rejectTarget.id
                        ? "Memproses..."
                        : "Konfirmasi Tolak"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


function Stat({
  label,
  value,
  subtitle,
  icon,
  tone = "blue",
}) {
  const tones = {
    blue: "theme-info",
    sky: "theme-info",
    emerald: "theme-success",
    amber: "theme-warning",
    red: "theme-danger",
  };

  const icons = {
    chat: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 3v4M8 3v4M3 11h18"
        />
      </>
    ),
    x: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    ban: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.6 5.6l12.8 12.8"
        />
      </>
    ),
  };

  return (
    <div className="theme-card rounded-xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            tones[tone] || tones.blue
          } ring-1 ring-current/10`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {icons[icon]}
          </svg>
        </div>
      </div>

      {subtitle && (
        <p className="theme-text-muted mt-3 text-xs font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
