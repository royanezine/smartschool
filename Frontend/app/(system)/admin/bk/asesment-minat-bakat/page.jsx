"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  getAsesmenMinatBakat,
  deleteAsesmenMinatBakat,
} from "../../../../../services/bk.service";

export default function AsesmenMinatBakatPage() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("tanggal_desc");

  const [page, setPage] = useState(1);
  const perPage = 7;

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const result = await getAsesmenMinatBakat();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data asesmen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      const result = await getAsesmenMinatBakat();
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

    const filtered = data.filter(
      (item) =>
        item.siswa?.namaLengkap?.toLowerCase().includes(keyword) ||
        item.jenis?.toLowerCase().includes(keyword)
    );

    const sorted = [...filtered];
    const compareTanggal = (a, b) => {
      const ta = a.tanggal ? new Date(a.tanggal).getTime() : 0;
      const tb = b.tanggal ? new Date(b.tanggal).getTime() : 0;
      return ta - tb;
    };
    const compareNama = (a, b) => {
      const na = (a.siswa?.namaLengkap || a.siswaId || "").toLowerCase();
      const nb = (b.siswa?.namaLengkap || b.siswaId || "").toLowerCase();
      return na.localeCompare(nb, "id");
    };
    const compareSkor = (a, b) => (Number(a.skor) || 0) - (Number(b.skor) || 0);

    if (sortBy === "tanggal_desc") sorted.sort((a, b) => compareTanggal(b, a));
    else if (sortBy === "tanggal_asc") sorted.sort(compareTanggal);
    else if (sortBy === "nama_asc") sorted.sort(compareNama);
    else if (sortBy === "nama_desc") sorted.sort((a, b) => compareNama(b, a));
    else if (sortBy === "skor_desc") sorted.sort((a, b) => compareSkor(b, a));
    else if (sortBy === "skor_asc") sorted.sort(compareSkor);

    return sorted;
  }, [data, search, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy]);

  const totalPage = Math.max(1, Math.ceil(filteredData.length / perPage));
  const startIndex = (page - 1) * perPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + perPage);

  const stats = useMemo(() => {
    const totalSiswa = new Set(
      data.map((i) => i.siswa?.id || i.siswaId).filter(Boolean)
    ).size;
    const selesai = data.filter(
      (i) => (i.status || "").toLowerCase() === "selesai"
    ).length;
    const rataSkor =
      data.length > 0
        ? Math.round(
            data.reduce((s, i) => s + (Number(i.skor) || 0), 0) / data.length
          )
        : 0;
    return { total: data.length, siswa: totalSiswa, selesai, rataSkor };
  }, [data]);

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus asesmen ini?")) return;
    try {
      await deleteAsesmenMinatBakat(id);
      await loadData();
    } catch (err) {
      setError(err?.message || "Gagal menghapus asesmen.");
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

  function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "selesai")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (s === "proses" || s === "berlangsung")
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    if (s === "dibatalkan")
      return "bg-red-50 text-red-700 ring-1 ring-red-200";
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  function resetFilter() {
    setSearch("");
    setSortBy("tanggal_desc");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">

            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                    Asesmen Minat &amp; Bakat
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Kelola hasil asesmen minat dan bakat siswa
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Muat ulang data"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                  onClick={() => router.push("/admin/bk/asesment-minat-bakat/tambah")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Asesmen
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {/* STATS */}
            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total Asesmen" value={stats.total} subtitle="Semua asesmen" icon="note" tone="blue" />
              <Stat label="Siswa Terlibat" value={stats.siswa} subtitle="Siswa unik" icon="user" tone="sky" />
              <Stat label="Selesai" value={stats.selesai} subtitle="Asesmen tuntas" icon="check" tone="emerald" />
              <Stat label="Rata-rata Skor" value={stats.rataSkor} subtitle="Rata-rata" icon="star" tone="amber" />
            </div>

            {/* FILTER */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:flex-1">
                  <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama siswa atau jenis asesmen..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60"
                  />
                </div>

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
                    className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/60"
                  >
                    <option value="tanggal_desc">Tanggal Terbaru</option>
                    <option value="tanggal_asc">Tanggal Terlama</option>
                    <option value="nama_asc">Nama Siswa A → Z</option>
                    <option value="nama_desc">Nama Siswa Z → A</option>
                    <option value="skor_desc">Skor Tertinggi</option>
                    <option value="skor_asc">Skor Terendah</option>
                  </select>
                </div>

                <button
                  onClick={resetFilter}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
                  {sortBy === "skor_desc" && "Skor Tertinggi"}
                  {sortBy === "skor_asc" && "Skor Terendah"}
                </span>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Siswa</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Jenis</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Minat</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Bakat</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">Skor</th>
                      <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-12 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                            Memuat data...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-12 text-center text-sm font-medium text-slate-500">
                          Belum ada asesmen.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="transition hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/25">
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

                          <td className="px-5 py-4 font-medium text-slate-700">
                            {formatTanggal(item.tanggal)}
                          </td>

                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {item.jenis || "-"}
                          </td>

                          <td className="px-5 py-4 font-medium text-slate-700">
                            <div className="max-w-[150px] truncate">
                              {item.minat || "-"}
                            </div>
                          </td>

                          <td className="px-5 py-4 font-medium text-slate-700">
                            <div className="max-w-[150px] truncate">
                              {item.bakat || "-"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-900 ring-1 ring-slate-200">
                              {item.skor ?? "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => router.push(`/admin/bk/asesment-minat-bakat/${item.id}`)}
                                title="Detail"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => router.push(`/admin/bk/asesment-minat-bakat/${item.id}/edit`)}
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
                    dari <span className="font-bold text-slate-900">{filteredData.length}</span> data
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPage }).map((_, i) => {
                      const p = i + 1;
                      const active = p === page;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                            active
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
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
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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

function Stat({ label, value, subtitle, icon, tone = "blue" }) {
  const tones = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
    sky: { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  };
  const t = tones[tone] || tones.blue;

  const icons = {
    note: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 transition hover:shadow-lg">
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