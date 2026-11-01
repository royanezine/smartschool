"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  School,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { getMonitoringUsers, getSekolahBinaan } from "@/services/yayasan.service";

// Role yang didukung oleh Backend controller yayasanMonitoring.controller.ts
const ROLE_OPTIONS = [
  { label: "Semua Peran", value: "" },
  { label: "Siswa", value: "siswa" },
  { label: "Guru", value: "guru" },
  { label: "Admin Sekolah", value: "admin_sekolah" },
  { label: "Staf", value: "staf" },
];

export default function MonitoringPenggunaYayasanPage() {
  const [users, setUsers] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [statistik, setStatistik] = useState({ total: 0, aktif: 0, nonaktif: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSekolahId, setSelectedSekolahId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load daftar sekolah cabang untuk filter dropdown
  useEffect(() => {
    let cancelled = false;
    async function loadSekolah() {
      try {
        const res = await getSekolahBinaan();
        if (cancelled) return;
        const list = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setSekolahList(list);
      } catch (err) {
        console.error("Gagal memuat daftar sekolah untuk filter:", err);
      }
    }
    loadSekolah();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch users dari GET /api/yayasan/monitoring/users
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit: 10,
        };

        if (selectedRole) params.peran = selectedRole;
        if (selectedSekolahId) params.sekolahId = selectedSekolahId;
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const res = await getMonitoringUsers(params);
        if (cancelled) return;

        if (res?.success) {
          const items = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.items)
            ? res.data.items
            : [];
          setUsers(items);

          const meta = res?.meta || res?.data?.pagination || {};
          const totalCount = Number(meta.total ?? items.length);
          const aktifCount = items.filter((u) => u.status === "aktif").length;
          const nonaktifCount = items.filter((u) => u.status !== "aktif").length;

          setStatistik({
            total: totalCount,
            aktif: aktifCount,
            nonaktif: nonaktifCount,
          });

          setPagination({
            page: Number(meta.page || currentPage),
            limit: Number(meta.limit || 10),
            totalPages: Number(meta.totalPages || 1),
            total: totalCount,
          });
        } else {
          throw new Error(res?.message || "Gagal memuat data pengguna.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Terjadi kesalahan saat memuat monitoring pengguna.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [currentPage, selectedRole, selectedSekolahId, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleSekolahChange = (e) => {
    setSelectedSekolahId(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatRoleBadge = (peranObj) => {
    const raw = typeof peranObj === "object" ? (peranObj?.namaTampilan || peranObj?.nama) : peranObj;
    const r = String(raw || "").toUpperCase();
    if (r.includes("SISWA")) {
      return {
        label: "Siswa",
        className:
          "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]",
      };
    }
    if (r.includes("GURU")) {
      return {
        label: "Guru",
        className:
          "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)] border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]",
      };
    }
    if (r.includes("ADMIN")) {
      return {
        label: "Admin Sekolah",
        className:
          "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
      };
    }
    if (r.includes("STAF")) {
      return {
        label: "Staf",
        className:
          "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-text border-neutral-300 dark:border-neutral-700",
      };
    }
    return {
      label: raw || "-",
      className:
        "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-secondary border-transparent",
    };
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                Monitoring Pengguna Lintas Cabang
              </h1>
              <p className="text-sm theme-text-secondary">
                Pantau seluruh akun pengguna (Siswa, Guru, Admin Sekolah, Staf) lintas unit sekolah binaan yayasan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                // Force re-fetch
                setCurrentPage((prev) => (prev === 1 ? 1 : 1));
                setSearchQuery((prev) => prev);
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border theme-border px-3.5 py-2 text-xs font-semibold theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-all"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* KPI Strip dari backend res.data.statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="theme-card rounded-2xl border theme-border p-4 sm:p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Total Pengguna Terdata</p>
              <p className="text-xl font-bold theme-text mt-0.5">{statistik.total}</p>
              <p className="text-[11px] theme-text-muted">Semua unit sekolah binaan</p>
            </div>
          </div>

          <div className="theme-card rounded-2xl border theme-border p-4 sm:p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]">
              <UserCheck size={22} />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Pengguna Aktif</p>
              <p className="text-xl font-bold text-[var(--color-success)] mt-0.5">
                {statistik.aktif}
              </p>
              <p className="text-[11px] theme-text-muted">Akun berstatus aktif</p>
            </div>
          </div>

          <div className="theme-card rounded-2xl border theme-border p-4 sm:p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]">
              <UserX size={22} />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Pengguna Nonaktif</p>
              <p className="text-xl font-bold text-[var(--color-danger)] mt-0.5">
                {statistik.nonaktif}
              </p>
              <p className="text-[11px] theme-text-muted">Akun dinonaktifkan</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="theme-card rounded-2xl border theme-border p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="sm:col-span-5 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama, email, username..."
                className="w-full rounded-xl border theme-border bg-transparent pl-10 pr-20 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-3.5 theme-text-muted" />
              <button
                type="submit"
                className="absolute right-2 top-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-all"
              >
                Cari
              </button>
            </form>

            {/* Filter Peran */}
            <div className="sm:col-span-3">
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full rounded-xl border theme-border bg-[var(--color-card)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Sekolah */}
            <div className="sm:col-span-4">
              <select
                value={selectedSekolahId}
                onChange={handleSekolahChange}
                className="w-full rounded-xl border theme-border bg-[var(--color-card)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="">Semua Unit Sekolah</option>
                {sekolahList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.jenjang || "Umum"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="theme-card rounded-2xl border theme-border overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-[var(--color-danger)] mb-2" />
              <p className="text-sm font-medium theme-text">{error}</p>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-primary)] text-white"
              >
                <RefreshCw size={12} /> Coba Lagi
              </button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center">
              <Loader2 size={32} className="mx-auto text-[var(--color-primary)] animate-spin mb-3" />
              <p className="text-sm theme-text-muted">Memuat data pengguna...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
              <p className="text-sm font-semibold theme-text">Tidak ada pengguna ditemukan</p>
              <p className="text-xs theme-text-muted mt-1">
                Coba sesuaikan kata kunci pencarian atau ganti filter peran/sekolah.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-sm text-left">
                <thead className="bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] border-b theme-border text-xs uppercase tracking-wider theme-text-muted">
                  <tr>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Peran</th>
                    <th className="py-3 px-4">Unit Sekolah</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {users.map((u) => {
                    const badge = formatRoleBadge(u.peran || u.role);
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <p className="font-semibold theme-text truncate">
                            {u.namaLengkap || u.namaPengguna || "-"}
                          </p>
                          <p className="text-xs theme-text-muted truncate mt-0.5">
                            {u.email || "-"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium theme-text truncate">
                            {u.sekolah?.nama || "-"}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-mono theme-text-secondary">
                            @{u.namaPengguna || "-"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              u.status === "aktif" || u.status === "AKTIF"
                                ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]"
                                : "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]"
                            }`}
                          >
                            {u.status === "aktif" || u.status === "AKTIF" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t theme-border text-xs">
              <span className="theme-text-muted">
                Menampilkan halaman <strong>{pagination.page}</strong> dari{" "}
                <strong>{pagination.totalPages}</strong> ({pagination.total} total pengguna)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border theme-border px-2.5 py-1.5 theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border theme-border px-2.5 py-1.5 theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40 transition-all"
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
