"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import { getSesiKonseling, deleteSesiKonseling } from "../../../../../services/bk.service";

export default function SesiKonselingPage() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [sortBy, setSortBy] = useState("tanggal_desc");

  const [page, setPage] = useState(1);
  const perPage = 7;

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const result = await getSesiKonseling();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data sesi konseling.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      const result = await getSesiKonseling();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat ulang data.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase();

    const filtered = data.filter((item) => {
      const namaSiswa = item.siswa?.namaLengkap || "";
      const namaKonselor = item.konselor?.namaLengkap || "";
      const cocokSearch =
        !keyword ||
        namaSiswa.toLowerCase().includes(keyword) ||
        namaKonselor.toLowerCase().includes(keyword) ||
        item.topik?.toLowerCase().includes(keyword);
      const cocokStatus =
        statusFilter === "semua" || item.status === statusFilter;
      return cocokSearch && cocokStatus;
    });

    const sorted = [...filtered];
    const compareTanggal = (a, b) => {
      const ta = a.tanggal ? new Date(a.tanggal).getTime() : 0;
      const tb = b.tanggal ? new Date(b.tanggal).getTime() : 0;
      return ta - tb;
    };
    const compareNamaSiswa = (a, b) => {
      const na = (a.siswa?.namaLengkap || a.siswaId || "").toLowerCase();
      const nb = (b.siswa?.namaLengkap || b.siswaId || "").toLowerCase();
      return na.localeCompare(nb, "id");
    };

    if (sortBy === "tanggal_asc") sorted.sort(compareTanggal);
    else if (sortBy === "tanggal_desc") sorted.sort((a, b) => compareTanggal(b, a));
    else if (sortBy === "nama_asc") sorted.sort(compareNamaSiswa);
    else if (sortBy === "nama_desc") sorted.sort((a, b) => compareNamaSiswa(b, a));

    return sorted;
  }, [data, search, statusFilter, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  const totalPage = Math.max(1, Math.ceil(filteredData.length / perPage));
  const startIndex = (page - 1) * perPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + perPage);

  const stats = {
    total: data.length,
    dijadwalkan: data.filter((i) => i.status === "dijadwalkan").length,
    berlangsung: data.filter((i) => i.status === "berlangsung").length,
    selesai: data.filter((i) => i.status === "selesai").length,
    dibatalkan: data.filter((i) => i.status === "dibatalkan").length,
  };

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus sesi konseling ini?")) return;
    try {
      setError("");
      await deleteSesiKonseling(id);
      await loadData();
    } catch (err) {
      setError(err?.message || "Gagal menghapus sesi konseling.");
    }
  }

  function formatTanggal(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusLabel(status) {
    const map = {
      dijadwalkan: "Dijadwalkan",
      berlangsung: "Berlangsung",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return map[status] || status || "-";
  }

  function statusClass(status) {
    if (status === "selesai")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (status === "berlangsung")
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    if (status === "dibatalkan")
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function resetFilter() {
    setSearch("");
    setStatusFilter("semua");
    setSortBy("tanggal_desc");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-7">
          <div className="mx-auto w-full max-w-[1600px]">

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Sesi Konseling
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Kelola data sesi konseling siswa
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Muat ulang data"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshing ? "Memuat..." : "Refresh"}
                </button>

                <button
                  onClick={() => router.push("/admin/bk/sesi-konseling/tambah")}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Sesi
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* STATS */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Total Sesi" value={stats.total} subtitle="Seluruh sesi" icon="chat" tone="blue" />
              <Stat label="Dijadwalkan" value={stats.dijadwalkan} subtitle="Akan datang" icon="clock" tone="amber" />
              <Stat label="Berlangsung" value={stats.berlangsung} subtitle="Sedang berjalan" icon="play" tone="sky" />
              <Stat label="Selesai" value={stats.selesai} subtitle="Sudah selesai" icon="check" tone="emerald" />
              <Stat label="Dibatalkan" value={stats.dibatalkan} subtitle="Tidak jadi" icon="x" tone="red" />
            </div>

            {/* FILTER */}
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:flex-1">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama siswa, konselor, atau topik..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="semua">Semua Status</option>
                  <option value="dijadwalkan">Dijadwalkan</option>
                  <option value="berlangsung">Berlangsung</option>
                  <option value="selesai">Selesai</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>

                {/* SORT */}
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="tanggal_desc">Tanggal Terbaru</option>
                    <option value="tanggal_asc">Tanggal Terlama</option>
                    <option value="nama_asc">Nama Siswa A → Z</option>
                    <option value="nama_desc">Nama Siswa Z → A</option>
                  </select>
                </div>

                <button
                  onClick={resetFilter}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>

              {/* INFO SORT AKTIF */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-medium text-slate-500">Urutan:</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  {sortBy === "tanggal_desc" && "Tanggal Terbaru"}
                  {sortBy === "tanggal_asc" && "Tanggal Terlama"}
                  {sortBy === "nama_asc" && "Nama Siswa A → Z"}
                  {sortBy === "nama_desc" && "Nama Siswa Z → A"}
                </span>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Siswa</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Konselor</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Topik</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-5 py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                            Memuat data...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-5 py-12 text-center text-sm font-medium text-slate-500">
                          Belum ada data sesi konseling.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="transition hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 ring-1 ring-blue-100">
                                {initials(item.siswa?.namaLengkap || item.siswaId)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-slate-900">
                                  {item.siswa?.namaLengkap || item.siswaId}
                                </div>
                                <div className="text-xs font-medium text-slate-500">
                                  {item.siswa?.nis ? `NIS ${item.siswa.nis}` : "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                            {item.konselor?.namaLengkap || item.konselorId || "-"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-slate-800">
                              {formatTanggal(item.tanggal)}
                            </div>
                            {item.waktuMulai && (
                              <div className="text-xs font-medium text-slate-500">
                                {item.waktuMulai}
                                {item.waktuSelesai ? ` - ${item.waktuSelesai}` : ""}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                              {item.topik}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(item.status)}`}>
                              {statusLabel(item.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => router.push(`/admin/bk/sesi-konseling/${item.id}`)}
                                title="Detail"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => router.push(`/admin/bk/sesi-konseling/${item.id}/edit`)}
                                title="Edit"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleDelete(item.id)}
                                title="Hapus"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                                </svg>
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
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
                  <p className="text-sm font-medium text-slate-600">
                    Menampilkan{" "}
                    <span className="font-bold text-slate-900">
                      {startIndex + 1} - {Math.min(startIndex + perPage, filteredData.length)}
                    </span>{" "}
                    dari{" "}
                    <span className="font-bold text-slate-900">{filteredData.length}</span>{" "}
                    data
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPage }).map((_, i) => {
                      const p = i + 1;
                      const active = p === page;
                      if (totalPage > 7 && p !== 1 && p !== totalPage && Math.abs(p - page) > 1) {
                        if (p === 2 && page > 3) return <span key={p} className="px-1 text-slate-400">…</span>;
                        if (p === totalPage - 1 && page < totalPage - 2) return <span key={p} className="px-1 text-slate-400">…</span>;
                        return null;
                      }
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
                            active
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                      disabled={page === totalPage}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function Stat({ label, value, subtitle, icon, tone = "blue" }) {
  const tones = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
    sky: { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
    red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
  };
  const t = tones[tone] || tones.blue;

  const icons = {
    chat: <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.83L3 20l1.17-3.5A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    play: <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.bg} ${t.text} ring-1 ${t.ring}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {icons[icon]}
          </svg>
        </div>
      </div>
      {subtitle && <p className="mt-3 text-xs font-medium text-slate-500">{subtitle}</p>}
    </div>
  );
}