
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Warehouse,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  MapPin,
  Loader2,
  Boxes,
  Building2,
  AlertTriangle,
  MapPinned,
  RotateCcw,
  Eye,
} from "lucide-react";

import {
  getGudang,
  deleteGudang,
} from "@/services/sarpras.service";

// ======================================================
// THEME
// ======================================================

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]";

// ======================================================
// RESPONSE HANDLER
// Sesuai successResponse backend:
// { success, message, data }
// ======================================================

function extractGudang(response) {
  if (response?.success === false) {
    throw new Error(
      response.message || "Gagal mengambil data gudang."
    );
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  // Antisipasi response terbungkus dua kali.
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value) || 0
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  description,
}) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} ${themeCardShadow} group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="theme-text-muted text-xs font-bold uppercase tracking-wider">
            {title}
          </p>

          <p className="theme-text mt-2 text-3xl font-bold tracking-tight tabular-nums">
            {formatNumber(value)}
          </p>

          {description && (
            <p className="theme-text-placeholder mt-1 truncate text-xs">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function MasterGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [gudangList, setGudangList] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // ====================================================
  // GET GUDANG
  // GET /api/sarpras/gudang
  // ====================================================

  const loadGudang = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getGudang();

      const data = extractGudang(response);

      setGudangList(data);

    } catch (err) {
      console.error("Gagal mengambil data gudang:", err);

      setError(
        err?.message ||
          "Gagal mengambil data gudang dari server."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGudang();
  }, [loadGudang]);

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredGudang = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return gudangList
      .filter((item) => {
        const nama = String(item?.nama || "").toLowerCase();

        const lokasi = String(item?.lokasi || "").toLowerCase();

        const keterangan = String(
          item?.keterangan || ""
        ).toLowerCase();

        return (
          !keyword ||
          nama.includes(keyword) ||
          lokasi.includes(keyword) ||
          keterangan.includes(keyword)
        );
      })
      .sort((a, b) =>
        String(a?.nama || "").localeCompare(
          String(b?.nama || ""),
          "id"
        )
      );
  }, [gudangList, search]);

  // ====================================================
  // STATISTICS
  // ====================================================

  const totalGudang = gudangList.length;

  const gudangDenganLokasi = useMemo(() => {
    return gudangList.filter(
      (item) => String(item?.lokasi || "").trim() !== ""
    ).length;
  }, [gudangList]);

  const gudangTanpaLokasi =
    totalGudang - gudangDenganLokasi;

  // ====================================================
  // DELETE GUDANG
  // DELETE /api/sarpras/gudang/:id
  // ====================================================

  const handleDelete = async (id, nama) => {
    if (!id) {
      window.alert("ID gudang tidak ditemukan.");
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus gudang "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      setError("");

      const response = await deleteGudang(id);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal menghapus gudang."
        );
      }

      // Backend menggunakan soft delete.
      // Hapus dari daftar lokal setelah API berhasil.
      setGudangList((current) =>
        current.filter(
          (item) => String(item.id) !== String(id)
        )
      );

      window.alert(
        `Gudang "${nama}" berhasil dihapus.`
      );

    } catch (err) {
      console.error("Gagal menghapus gudang:", err);

      window.alert(
        err?.message || "Gagal menghapus gudang."
      );

      await loadGudang(true);

    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // RESET SEARCH
  // ====================================================

  const handleReset = () => {
    setSearch("");
  };

  // ====================================================
  // SIDEBAR
  // ====================================================

  const toggleSidebar = () => {
    setIsCollapsed((current) => !current);
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <div className="shrink-0 border-b theme-border">
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

        {/* MAIN */}
        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">

            <div className="w-full space-y-6">

              {/* ======================================
                  PAGE TITLE
              ====================================== */}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-card)] shadow-lg">
                    <Warehouse size={24} />
                  </div>

                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Master Gudang
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Kelola data gudang penyimpanan sarana dan prasarana sekolah.
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={() => loadGudang(true)}
                    disabled={refreshing || loading}
                    className={`theme-card theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-4 text-sm font-semibold shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-60`}
                  >
                    <RefreshCw
                      size={16}
                      className={
                        refreshing ? "animate-spin" : ""
                      }
                    />

                    <span className="hidden sm:inline">
                      Refresh
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/gudang/master/tambah"
                      )
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-card)] shadow-sm transition hover:brightness-110"
                  >
                    <Plus size={18} />
                    Tambah Gudang
                  </button>

                </div>
              </div>

              {/* ======================================
                  ERROR MESSAGE
              ====================================== */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] p-4 text-[var(--color-danger)]">

                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold">
                      Gagal memuat data
                    </p>

                    <p className="mt-1 text-xs">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => loadGudang()}
                      className="mt-2 text-xs font-semibold underline underline-offset-2"
                    >
                      Coba lagi
                    </button>

                  </div>
                </div>
              )}

              {/* ======================================
                  STATISTICS
              ====================================== */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <StatCard
                  title="Total Gudang"
                  value={totalGudang}
                  icon={Boxes}
                  iconBg={themePrimarySoft}
                  iconColor={themePrimaryText}
                  description="Semua gudang terdaftar"
                />

                <StatCard
                  title="Gudang dengan Lokasi"
                  value={gudangDenganLokasi}
                  icon={MapPinned}
                  iconBg={themePrimarySoft}
                  iconColor="theme-primary-text"
                  description="Gudang yang memiliki informasi lokasi"
                />

                <StatCard
                  title="Lokasi Belum Diisi"
                  value={gudangTanpaLokasi}
                  icon={MapPin}
                  iconBg={themePrimarySoft}
                  iconColor="theme-primary-text"
                  description="Gudang tanpa informasi lokasi"
                />

              </div>

              {/* ======================================
                  SEARCH
              ====================================== */}

              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-2xl border p-4`}
              >

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  <div className="relative min-w-0 flex-1">

                    <Search
                      size={18}
                      className="theme-text-placeholder pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari nama, lokasi, atau keterangan gudang..."
                      className={`theme-input h-11 w-full rounded-xl border ${themeNeutralBorder} pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]`}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!search}
                    className="theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCcw size={15} />
                    Reset
                  </button>

                </div>
              </div>

              {/* ======================================
                  TABLE
              ====================================== */}

              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-2xl border`}
              >

                {/* TABLE HEADER */}
                <div className="flex flex-col gap-2 border-b theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="theme-text text-base font-bold">
                      Data Gudang
                    </h2>

                    <p className="theme-text-muted mt-1 text-xs">
                      Daftar gudang berdasarkan sekolah yang sedang login.
                    </p>
                  </div>

                  <p className="theme-text-secondary text-xs font-medium">
                    Menampilkan{" "}
                    {formatNumber(filteredGudang.length)} dari{" "}
                    {formatNumber(totalGudang)} gudang
                  </p>

                </div>

                {/* TABLE CONTENT */}
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[750px] text-sm">

                    <thead>
                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface} text-left text-[11px] uppercase tracking-wider theme-text-muted`}
                      >
                        <th className="px-6 py-4 font-semibold">
                          Nama Gudang
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Lokasi
                        </th>

                        <th className="px-6 py-4 font-semibold">
                          Keterangan
                        </th>

                        <th className="px-6 py-4 text-center font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">

                      {/* LOADING */}
                      {loading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-16 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <Loader2
                                size={28}
                                className={`${themePrimaryText} animate-spin`}
                              />

                              <p className="theme-text-muted mt-3 text-sm">
                                Memuat data gudang...
                              </p>

                            </div>

                          </td>
                        </tr>

                      ) : filteredGudang.length === 0 ? (

                        /* EMPTY STATE */
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-16 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div
                                className={`flex h-16 w-16 items-center justify-center rounded-full ${themePrimarySoft}`}
                              >
                                <Warehouse
                                  size={32}
                                  className={`${themePrimaryText} opacity-50`}
                                />
                              </div>

                              <p className="theme-text mt-4 text-sm font-semibold">
                                {search
                                  ? "Gudang tidak ditemukan"
                                  : "Belum ada gudang"}
                              </p>

                              <p className="theme-text-muted mt-1 max-w-sm text-xs">
                                {search
                                  ? "Tidak ada gudang yang sesuai dengan pencarian."
                                  : "Tambahkan gudang terlebih dahulu agar dapat digunakan pada inventaris barang."}
                              </p>

                              {search ? (

                                <button
                                  type="button"
                                  onClick={handleReset}
                                  className={`mt-5 inline-flex items-center gap-2 rounded-xl border ${themeNeutralBorder} px-5 py-2.5 text-sm font-semibold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]`}
                                >
                                  <RotateCcw size={15} />
                                  Reset Pencarian
                                </button>

                              ) : (

                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      "/admin/sarpras/gudang/master/tambah"
                                    )
                                  }
                                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] shadow-sm transition hover:brightness-110"
                                >
                                  <Plus size={16} />
                                  Tambah Gudang
                                </button>

                              )}

                            </div>

                          </td>
                        </tr>

                      ) : (

                        /* GUDANG DATA */
                        filteredGudang.map((item) => {

                          const isDeleting =
                            deletingId === item.id;

                          return (
                            <tr
                              key={item.id}
                              className="transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                            >

                              {/* NAMA */}
                              <td className="px-6 py-4">

                                <div className="flex items-center gap-3">

                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                                  >
                                    <Building2 size={18} />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="theme-text truncate font-semibold">
                                      {item?.nama || "-"}
                                    </p>

                                    <p className="theme-text-placeholder mt-0.5 text-[11px]">
                                      Gudang Sarpras
                                    </p>

                                  </div>

                                </div>

                              </td>

                              {/* LOKASI */}
                              <td className="px-6 py-4">

                                <div className="flex items-center gap-2 theme-text-secondary">

                                  <MapPin
                                    size={15}
                                    className="theme-text-placeholder shrink-0"
                                  />

                                  <span>
                                    {item?.lokasi?.trim() ||
                                      "Tidak ada lokasi"}
                                  </span>

                                </div>

                              </td>

                              {/* KETERANGAN */}
                              <td className="px-6 py-4">

                                <span className="theme-text-secondary line-clamp-2 text-xs">
                                  {item?.keterangan?.trim() || "-"}
                                </span>

                              </td>

                              {/* ACTION */}
                              <td className="px-6 py-4">

                                <div className="flex items-center justify-center gap-2">

                                  {/* DETAIL */}
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() =>
                                      router.push(
                                        `/admin/sarpras/gudang/master/detail/${item.id}`
                                      )
                                    }
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-muted transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-40`}
                                    title="Detail Gudang"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  {/* EDIT */}
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() =>
                                      router.push(
                                        `/admin/sarpras/gudang/master/edit/${item.id}`
                                      )
                                    }
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-muted transition hover:border-[var(--color-warning)] hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] hover:text-[var(--color-warning)] disabled:opacity-40`}
                                    title="Edit Gudang"
                                  >
                                    <Edit size={15} />
                                  </button>

                                  {/* DELETE */}
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() =>
                                      handleDelete(
                                        item.id,
                                        item?.nama || "gudang"
                                      )
                                    }
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-muted transition hover:border-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-40`}
                                    title="Hapus Gudang"
                                  >
                                    {isDeleting ? (
                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={15} />
                                    )}
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        })

                      )}

                    </tbody>

                  </table>

                </div>

                {/* TABLE FOOTER */}
                <div
                  className={`flex flex-col gap-1 border-t ${themeDivider} ${themeNeutralSurface} px-5 py-3 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
                >
                  <span>
                    Menampilkan{" "}
                    <strong className="theme-text">
                      {formatNumber(filteredGudang.length)}
                    </strong>{" "}
                    dari{" "}
                    <strong className="theme-text">
                      {formatNumber(totalGudang)}
                    </strong>{" "}
                    gudang
                  </span>

                  <span>
                    Data tersinkronisasi dengan server
                  </span>
                </div>

              </div>

              {/* FOOTER */}
              <footer
                className={`border-t ${themeDivider} py-5 text-center text-[11px] theme-text-muted`}
              >
                © 2026 SmartSchool • Master Gudang Sarana & Prasarana
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
