"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  GraduationCap,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getLaporanGuru } from "@/services/yayasan.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function LaporanGuruPage() {
  const [search, setSearch] = useState("");
  const [guruList, setGuruList] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuru = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLaporanGuru();
      const raw = Array.isArray(res?.data) ? res.data : [];
      const mapped = raw.map((g) => ({
        id: g.id,
        nama: g.namaLengkap || g.namaPengguna || "-",
        namaPengguna: g.namaPengguna || "-",
        sekolah: g.sekolah?.nama || "-",
        status: g.status === "aktif" ? "Aktif" : "Nonaktif",
        email: g.email || "-",
        peran: g.peran?.namaTampilan || g.peran?.nama || "Guru",
      }));
      setGuruList(mapped);
      setMeta(res?.meta || null);
    } catch (err) {
      setError(err?.message || "Gagal memuat data guru yayasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getLaporanGuru();
        if (cancelled) return;
        const raw = Array.isArray(res?.data) ? res.data : [];
        const mapped = raw.map((g) => ({
          id: g.id,
          nama: g.namaLengkap || g.namaPengguna || "-",
          namaPengguna: g.namaPengguna || "-",
          sekolah: g.sekolah?.nama || "-",
          status: g.status === "aktif" ? "Aktif" : "Nonaktif",
          email: g.email || "-",
          peran: g.peran?.namaTampilan || g.peran?.nama || "Guru",
        }));
        setGuruList(mapped);
        setMeta(res?.meta || null);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Gagal memuat data guru yayasan.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGuru = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guruList;
    return guruList.filter(
      (g) =>
        g.nama.toLowerCase().includes(q) ||
        g.sekolah.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q)
    );
  }, [guruList, search]);

  const totalGuru = meta?.total ?? guruList.length;
  const guruAktif = guruList.filter((g) => g.status === "Aktif").length;
  const guruNonaktif = guruList.filter((g) => g.status !== "Aktif").length;

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`shrink-0 rounded-lg p-2 ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
              >
                <GraduationCap size={18} />
              </div>
              <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                Laporan Guru
              </h1>
            </div>
            <p className="theme-text-secondary ml-[42px] mt-1 text-sm">
              Data dan status guru di seluruh sekolah
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Total Guru</p>
                <p className="theme-text mt-1 text-2xl font-semibold">
                  {loading ? "..." : totalGuru}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Guru Aktif</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--color-success)]">
                  {loading ? "..." : guruAktif}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="theme-text-secondary text-sm">Guru Nonaktif</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--color-warning)]">
                  {loading ? "..." : guruNonaktif}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="theme-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau sekolah..."
            className={`theme-border theme-card theme-text-secondary w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
          />
        </div>

        {/* Table */}
        <div
          className={`theme-border theme-card overflow-hidden rounded-xl border ${themeCardShadow}`}
        >
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead
                className={`${themeNeutralSurface} theme-text-secondary text-xs uppercase`}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Peran</th>
                  <th className="px-4 py-3 font-semibold">Sekolah</th>
                  <th className="px-4 py-3 font-semibold">Kontak</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2
                        size={24}
                        className="mx-auto mb-2 animate-spin text-[var(--color-primary)]"
                      />
                      <p className="theme-text-muted text-sm">
                        Memuat data guru dari server...
                      </p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[var(--color-danger)]"
                    >
                      <AlertCircle size={24} className="mx-auto mb-2" />
                      <p className="text-sm font-medium">{error}</p>
                      <button
                        type="button"
                        onClick={fetchGuru}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : filteredGuru.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <div
                        className={`theme-text-muted mx-auto flex h-10 w-10 items-center justify-center rounded-full ${themeNeutralSurface}`}
                      >
                        <Search size={18} />
                      </div>
                      <p className="theme-text-muted mt-3 text-sm">
                        Tidak ada data guru yang cocok.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredGuru.map((g, index) => (
                    <tr
                      key={g.id}
                      className={`${themeNeutralHover} transition-colors ${
                        index !== filteredGuru.length - 1
                          ? `border-b ${themeDivider}`
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                          >
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <span className="theme-text font-medium">{g.nama}</span>
                        </div>
                      </td>
                      <td className="theme-text-secondary px-4 py-3">
                        {g.namaPengguna}
                      </td>
                      <td className="theme-text-secondary px-4 py-3">{g.peran}</td>
                      <td className="theme-text-secondary px-4 py-3">
                        {g.sekolah}
                      </td>
                      <td className="theme-text-secondary px-4 py-3">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1.5">
                            <Mail className="theme-text-muted h-3 w-3 shrink-0" />
                            <span className="truncate">{g.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            g.status === "Aktif"
                              ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
                              : "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]"
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}