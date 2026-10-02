"use client";

import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  XCircle,
  Loader2,
  Boxes,
} from "lucide-react";

import {
  getGudang,
  deleteGudang,
} from "@/services/sarpras.service";

/* =========================================================
   GLOBAL THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* =========================================================
   RESPONSE HELPER
========================================================= */

function extractArray(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
}

/* =========================================================
   PAGE
========================================================= */

export default function MasterGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [gudangList, setGudangList] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("Semua");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadGudang(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getGudang();

      console.log(
        "Response gudang:",
        response
      );

      const data =
        extractArray(response);

      console.log(
        "Data gudang:",
        data
      );

      setGudangList(data);
    } catch (err) {
      console.error(
        "Gagal mengambil data gudang:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data gudang dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadGudang();
  }, []);

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredGudang = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return gudangList.filter((item) => {
      const nama = String(
        item?.nama || ""
      ).toLowerCase();

      const lokasi = String(
        item?.lokasi || ""
      ).toLowerCase();

      const status = String(
        item?.status || "aktif"
      ).toLowerCase();

      const matchSearch =
        !keyword ||
        nama.includes(keyword) ||
        lokasi.includes(keyword);

      const matchStatus =
        statusFilter === "Semua" ||
        status === statusFilter;

      return (
        matchSearch &&
        matchStatus
      );
    });
  }, [
    gudangList,
    search,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalGudang =
    gudangList.length;

  const gudangAktif =
    gudangList.filter(
      (item) =>
        String(
          item?.status || "aktif"
        ).toLowerCase() === "aktif"
    ).length;

  const gudangNonaktif =
    gudangList.filter(
      (item) =>
        String(
          item?.status || ""
        ).toLowerCase() ===
        "nonaktif"
    ).length;

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(
    id,
    nama
  ) {
    const confirmed =
      window.confirm(
        `Yakin ingin menghapus gudang "${nama}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteGudang(id);

      setGudangList((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      window.alert(
        `Gudang "${nama}" berhasil dihapus.`
      );
    } catch (err) {
      console.error(
        "Gagal menghapus gudang:",
        err
      );

      window.alert(
        err?.message ||
          "Gagal menghapus gudang."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     RESET FILTER
  ========================================================= */

  function handleReset() {
    setSearch("");
    setStatusFilter("Semua");
  }

  /* =========================================================
     SIDEBAR
  ========================================================= */

  function toggleSidebar() {
    setIsCollapsed(
      (current) => !current
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page h-screen overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="z-30 flex-shrink-0">
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
        </div>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="w-full p-4 md:p-6 lg:p-8">

            <div className="mx-auto w-full max-w-[1600px] space-y-5">

              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <Warehouse size={21} />
                  </div>

                  <div className="min-w-0">

                    <h1 className="theme-text text-xl font-semibold">
                      Master Gudang
                    </h1>

                    <p className="theme-text-muted mt-0.5 text-sm">
                      Kelola data gudang
                      penyimpanan sarana dan
                      prasarana sekolah
                    </p>

                  </div>

                </div>

                {/* ACTION */}

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      loadGudang(true)
                    }
                    disabled={refreshing}
                    className={`theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-3.5 py-2.5 text-sm font-medium ${themeSmallShadow} transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <RefreshCw
                      size={16}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
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
                    className={`inline-flex items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95`}
                  >
                    <Plus size={17} />
                    Tambah Gudang
                  </button>

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
                >

                  <XCircle
                    size={19}
                    className="theme-danger mt-0.5 flex-shrink-0"
                  />

                  <div className="min-w-0">

                    <p className="theme-danger text-sm font-semibold">
                      Gagal memuat data
                    </p>

                    <p className="theme-danger mt-1 text-sm">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        loadGudang()
                      }
                      className="theme-danger mt-3 text-sm font-semibold underline underline-offset-2"
                    >
                      Coba lagi
                    </button>

                  </div>

                </div>
              )}

              {/* =================================================
                  STATISTIK
              ================================================= */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                {/* TOTAL */}

                <div
                  className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="theme-text-muted text-xs font-medium">
                        Total Gudang
                      </p>

                      <p className="theme-text mt-1 text-2xl font-bold">
                        {totalGudang}
                      </p>

                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Boxes size={19} />
                    </div>

                  </div>

                </div>

                {/* AKTIF */}

                <div
                  className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="theme-text-muted text-xs font-medium">
                        Gudang Aktif
                      </p>

                      <p className="theme-success mt-1 text-2xl font-bold">
                        {gudangAktif}
                      </p>

                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeSuccessSurface} theme-success`}
                    >
                      <CheckCircle2 size={19} />
                    </div>

                  </div>

                </div>

                {/* NONAKTIF */}

                <div
                  className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="theme-text-muted text-xs font-medium">
                        Gudang Nonaktif
                      </p>

                      <p className="theme-danger mt-1 text-2xl font-bold">
                        {gudangNonaktif}
                      </p>

                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themeDangerSurface} theme-danger`}
                    >
                      <XCircle size={19} />
                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  FILTER
              ================================================= */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                  {/* SEARCH */}

                  <div className="relative min-w-0 flex-1">

                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Cari nama atau lokasi gudang..."
                      className={`theme-input w-full rounded-xl border ${themeNeutralBorder} py-2.5 pl-10 pr-4 text-sm outline-none transition ${themeFocus}`}
                    />

                  </div>

                  {/* STATUS */}

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className={`theme-input w-full cursor-pointer rounded-xl border ${themeNeutralBorder} px-3 py-2.5 text-sm font-medium outline-none transition ${themeFocus} lg:w-[180px]`}
                  >

                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="aktif">
                      Aktif
                    </option>

                    <option value="nonaktif">
                      Nonaktif
                    </option>

                  </select>

                  {/* RESET */}

                  <button
                    type="button"
                    onClick={handleReset}
                    className={`theme-text-muted rounded-xl px-3 py-2.5 text-sm font-medium transition ${themeNeutralHover} hover:text-[var(--color-text)]`}
                  >
                    Reset
                  </button>

                </div>

              </div>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div
                className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px] text-sm">

                    {/* =================================================
                        TABLE HEAD
                    ================================================= */}

                    <thead>

                      <tr
                        className={`${themePrimaryGradient} text-[var(--color-card)]`}
                      >

                        <th className="px-5 py-3 text-left font-semibold">
                          Nama Gudang
                        </th>

                        <th className="px-5 py-3 text-left font-semibold">
                          Lokasi
                        </th>

                        <th className="px-5 py-3 text-left font-semibold">
                          Status
                        </th>

                        <th className="px-5 py-3 text-center font-semibold">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    {/* =================================================
                        TABLE BODY
                    ================================================= */}

                    <tbody>

                      {/* LOADING */}

                      {loading ? (
                        <tr>

                          <td
                            colSpan={4}
                            className="px-5 py-16 text-center"
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

                      ) : filteredGudang.length ===
                        0 ? (

                        /* =================================================
                           EMPTY
                        ================================================= */

                        <tr>

                          <td
                            colSpan={4}
                            className="px-5 py-16 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft}`}
                              >
                                <Warehouse
                                  size={28}
                                  className={`${themePrimaryText} opacity-45`}
                                />
                              </div>

                              <p className="theme-text-secondary mt-3 text-sm font-semibold">
                                Belum ada gudang
                              </p>

                              <p className="theme-text-muted mt-1 max-w-sm text-xs">
                                {search ||
                                statusFilter !==
                                  "Semua"
                                  ? "Tidak ada gudang yang sesuai dengan pencarian atau filter."
                                  : "Tambahkan gudang terlebih dahulu agar dapat digunakan pada inventaris barang."}
                              </p>

                              {!search &&
                                statusFilter ===
                                  "Semua" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        "/admin/sarpras/gudang/master/tambah"
                                      )
                                    }
                                    className={`mt-4 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95`}
                                  >
                                    <Plus size={16} />
                                    Tambah Gudang
                                  </button>
                                )}

                            </div>

                          </td>

                        </tr>

                      ) : (

                        /* =================================================
                           DATA
                        ================================================= */

                        filteredGudang.map(
                          (item, index) => {

                            const status =
                              String(
                                item?.status ||
                                  "aktif"
                              ).toLowerCase();

                            const isDeleting =
                              deletingId ===
                              item.id;

                            return (
                              <tr
                                key={item.id}
                                className={`border-b ${themeDivider} last:border-0 transition ${themeNeutralHover} ${
                                  index % 2 ===
                                  0
                                    ? themeNeutralSurface
                                    : ""
                                }`}
                              >

                                {/* NAMA */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                                    >
                                      <Warehouse
                                        size={17}
                                      />
                                    </div>

                                    <div>

                                      <p className="theme-text font-semibold">
                                        {item?.nama ||
                                          "-"}
                                      </p>

                                      <p className="theme-text-muted mt-0.5 text-xs">
                                        Gudang Sarpras
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                {/* LOKASI */}

                                <td className="px-5 py-4">

                                  <div className="theme-text-secondary flex items-center gap-2">

                                    <MapPin
                                      size={15}
                                      className="theme-text-muted"
                                    />

                                    <span>
                                      {item?.lokasi ||
                                        "Tidak ada lokasi"}
                                    </span>

                                  </div>

                                </td>

                                {/* STATUS */}

                                <td className="px-5 py-4">

                                  {status ===
                                  "aktif" ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-lg ${themeSuccessSurface} px-2.5 py-1.5 text-xs font-semibold theme-success`}
                                    >
                                      <CheckCircle2
                                        size={14}
                                      />

                                      Aktif
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-lg ${themeDangerSurface} px-2.5 py-1.5 text-xs font-semibold theme-danger`}
                                    >
                                      <XCircle
                                        size={14}
                                      />

                                      Nonaktif
                                    </span>
                                  )}

                                </td>

                                {/* AKSI */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center justify-center gap-1">

                                    {/* EDIT */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/sarpras/gudang/master/edit/${item.id}`
                                        )
                                      }
                                      className={`theme-text-muted rounded-lg p-2 transition ${themeWarningSurface} hover:text-[var(--color-warning)]`}
                                      title="Edit Gudang"
                                    >
                                      <Edit
                                        size={16}
                                      />
                                    </button>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      disabled={
                                        isDeleting
                                      }
                                      onClick={() =>
                                        handleDelete(
                                          item.id,
                                          item?.nama ||
                                            "gudang"
                                        )
                                      }
                                      className={`theme-text-muted rounded-lg p-2 transition ${themeDangerSurface} hover:theme-danger disabled:cursor-not-allowed disabled:opacity-40`}
                                      title="Hapus Gudang"
                                    >
                                      {isDeleting ? (
                                        <Loader2
                                          size={16}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2
                                          size={16}
                                        />
                                      )}
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer
                className={`border-t ${themeDivider} py-4 text-center text-[11px] theme-text-muted`}
              >
                © 2026 SmartSchool • Master Gudang
                Sarana & Prasarana
              </footer>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}