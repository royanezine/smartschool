"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Layers3,
  ChevronRight,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  getKategoriAset,
  deleteKategoriAset,
} from "../../../../services/sarpras.service";

function extractArray(response) {
  if (Array.isArray(response)) return response;

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

export default function KategoriPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [error, setError] = useState("");

  useEffect(() => {
    loadKategori();
  }, []);

  async function loadKategori() {
    try {
      setLoading(true);
      setError("");

      const response = await getKategoriAset();
      const data = extractArray(response);

      setKategoriList(data);
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);

      setError(
        err?.message || "Gagal mengambil data kategori aset."
      );

      setKategoriList([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, nama) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      setError("");

      await deleteKategoriAset(id);

      setKategoriList((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);

      setError(
        err?.message || "Gagal menghapus kategori aset."
      );
    } finally {
      setDeleting(null);
    }
  }

  const filteredKategori = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return kategoriList.filter((item) => {
      const nama = String(item?.nama || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();

      const matchSearch =
        !keyword || nama.includes(keyword);

      const matchStatus =
        filterStatus === "semua" ||
        status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [kategoriList, search, filterStatus]);

  const totalKategori = kategoriList.length;

  const kategoriAktif = kategoriList.filter(
    (item) =>
      String(item?.status || "").toLowerCase() === "aktif"
  ).length;

  const kategoriNonaktif = kategoriList.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "nonaktif"
  ).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
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
        className={`flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >
        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(!isCollapsed)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 pb-10 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
            <div className="mx-auto w-full max-w-[1380px]">

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="mb-7">
                

                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_22px_rgba(37,99,235,0.18)]">
                      <Tag
                        size={26}
                        strokeWidth={1.9}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                          Sarana & Prasarana
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                        <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:block">
                          Master Data
                        </span>
                      </div>

                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Kategori Aset
                      </h1>

                      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                        Kelola kategori untuk mengelompokkan
                        barang inventaris sekolah dengan lebih
                        terstruktur.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/sarpras/kategori/tambah"
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.24)] active:scale-[0.98]"
                  >
                    <Plus size={18} />
                    Tambah Kategori
                  </Link>
                </div>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-rose-800">
                      Terjadi Kesalahan
                    </p>

                    <p className="mt-1 text-sm leading-5 text-rose-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadKategori}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* TOTAL */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Total Kategori
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {totalKategori}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Seluruh kategori aset
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Layers3 size={21} />
                    </div>
                  </div>
                </div>

                {/* AKTIF */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Kategori Aktif
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                        {kategoriAktif}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Siap digunakan pada aset
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={21} />
                    </div>
                  </div>
                </div>

                {/* NONAKTIF */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Kategori Nonaktif
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-600">
                        {kategoriNonaktif}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Tidak digunakan sementara
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <XCircle size={21} />
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  MAIN CARD
              ================================================= */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">

                {/* CARD HEADER */}

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Tag size={18} />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Daftar Kategori
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {filteredKategori.length} dari{" "}
                          {totalKategori} kategori ditampilkan
                        </p>
                      </div>
                    </div>

                    {/* FILTER */}

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                      <div className="relative min-w-0 flex-1 sm:min-w-[260px] lg:w-[300px] lg:flex-none">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Cari kategori..."
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <select
                        value={filterStatus}
                        onChange={(e) =>
                          setFilterStatus(e.target.value)
                        }
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="semua">
                          Semua Status
                        </option>

                        <option value="aktif">
                          Aktif
                        </option>

                        <option value="nonaktif">
                          Nonaktif
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={loadKategori}
                        disabled={loading}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw
                          size={16}
                          className={
                            loading
                              ? "animate-spin"
                              : ""
                          }
                        />

                        <span className="hidden sm:inline">
                          Refresh
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (
                  <div className="flex min-h-[360px] items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Loader2
                          size={25}
                          className="animate-spin"
                        />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Memuat kategori
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Mengambil data dari sistem...
                      </p>
                    </div>
                  </div>
                ) : filteredKategori.length === 0 ? (
                  /* =================================================
                     EMPTY
                  ================================================= */

                  <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Tag size={27} />
                    </div>

                    <h3 className="mt-5 text-base font-bold text-slate-800">
                      {kategoriList.length === 0
                        ? "Belum ada kategori"
                        : "Kategori tidak ditemukan"}
                    </h3>

                    <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">
                      {kategoriList.length === 0
                        ? "Tambahkan kategori aset terlebih dahulu agar dapat digunakan pada inventaris."
                        : "Tidak ada kategori yang sesuai dengan pencarian atau filter yang dipilih."}
                    </p>

                    {kategoriList.length === 0 && (
                      <Link
                        href="/admin/sarpras/kategori/tambah"
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Plus size={17} />
                        Tambah Kategori
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    {/* =================================================
                        DESKTOP TABLE
                    ================================================= */}

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[720px] table-fixed">
                        <colgroup>
                          <col className="w-[80px]" />
                          <col />
                          <col className="w-[190px]" />
                          <col className="w-[150px]" />
                        </colgroup>

                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              No
                            </th>

                            <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Nama Kategori
                            </th>

                            <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Status
                            </th>

                            <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredKategori.map(
                            (item, index) => {
                              const aktif =
                                String(
                                  item?.status || ""
                                ).toLowerCase() ===
                                "aktif";

                              return (
                                <tr
                                  key={item.id}
                                  className="group border-b border-slate-100 last:border-0 transition hover:bg-slate-50/70"
                                >
                                  {/* NO */}

                                  <td className="px-6 py-4">
                                    <span className="text-xs font-semibold text-slate-400">
                                      {String(
                                        index + 1
                                      ).padStart(2, "0")}
                                    </span>
                                  </td>

                                  {/* NAMA */}

                                  <td className="px-6 py-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                                        <Tag size={17} />
                                      </div>

                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-800">
                                          {item.nama}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                          Kategori inventaris
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* STATUS */}

                                  <td className="px-6 py-4">
                                    {aktif ? (
                                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Aktif
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        Nonaktif
                                      </span>
                                    )}
                                  </td>

                                  {/* AKSI */}

                                  <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                      <Link
                                        href={`/admin/sarpras/kategori/edit/${item.id}`}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                        title="Edit kategori"
                                      >
                                        <Edit size={16} />
                                      </Link>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDelete(
                                            item.id,
                                            item.nama
                                          )
                                        }
                                        disabled={
                                          deleting ===
                                          item.id
                                        }
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Hapus kategori"
                                      >
                                        {deleting ===
                                        item.id ? (
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
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* =================================================
                        MOBILE LIST
                    ================================================= */}

                    <div className="divide-y divide-slate-100 md:hidden">
                      {filteredKategori.map(
                        (item, index) => {
                          const aktif =
                            String(
                              item?.status || ""
                            ).toLowerCase() ===
                            "aktif";

                          return (
                            <div
                              key={item.id}
                              className="p-4 transition hover:bg-slate-50/70"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                  <Tag size={17} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Kategori #
                                        {index + 1}
                                      </p>

                                      <p className="mt-1 truncate text-sm font-bold text-slate-800">
                                        {item.nama}
                                      </p>
                                    </div>

                                    {aktif ? (
                                      <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                        Aktif
                                      </span>
                                    ) : (
                                      <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                        Nonaktif
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-4 flex justify-end gap-2">
                                    <Link
                                      href={`/admin/sarpras/kategori/edit/${item.id}`}
                                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Edit size={14} />
                                      Edit
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(
                                          item.id,
                                          item.nama
                                        )
                                      }
                                      disabled={
                                        deleting ===
                                        item.id
                                      }
                                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {deleting ===
                                      item.id ? (
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2
                                          size={14}
                                        />
                                      )}

                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}

                {/* =================================================
                    TABLE FOOTER
                ================================================= */}

                {!loading &&
                  filteredKategori.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <p className="text-xs text-slate-400">
                        Menampilkan{" "}
                        <span className="font-semibold text-slate-600">
                          {filteredKategori.length}
                        </span>{" "}
                        kategori
                      </p>

                      <Link
                        href="/admin/sarpras/kategori/tambah"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                      >
                        Tambah kategori
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
              </div>

              {/* =================================================
                  BOTTOM INFO
              ================================================= */}

              <div className="mt-6 flex items-center justify-center gap-2 text-center">
                <div className="h-1 w-1 rounded-full bg-slate-300" />

                <p className="text-[11px] text-slate-400">
                  SmartSchool • Modul Sarana & Prasarana
                </p>

                <div className="h-1 w-1 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}