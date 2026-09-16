"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

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
} from "../../../../../services/sarpras.service";

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

export default function MasterGudangPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [gudangList, setGudangList] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  async function loadGudang(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getGudang();

      console.log("Response gudang:", response);

      const data = extractArray(response);

      console.log("Data gudang:", data);

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
  }

  useEffect(() => {
    loadGudang();
  }, []);

  const filteredGudang = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return gudangList.filter((item) => {
      const nama = String(item?.nama || "").toLowerCase();
      const lokasi = String(item?.lokasi || "").toLowerCase();
      const status = String(item?.status || "aktif").toLowerCase();

      const matchSearch =
        !keyword ||
        nama.includes(keyword) ||
        lokasi.includes(keyword);

      const matchStatus =
        statusFilter === "Semua" ||
        status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [gudangList, search, statusFilter]);

  const totalGudang = gudangList.length;

  const gudangAktif = gudangList.filter(
    (item) =>
      String(item?.status || "aktif").toLowerCase() ===
      "aktif"
  ).length;

  const gudangNonaktif = gudangList.filter(
    (item) =>
      String(item?.status || "").toLowerCase() ===
      "nonaktif"
  ).length;

  async function handleDelete(id, nama) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus gudang "${nama}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteGudang(id);

      setGudangList((current) =>
        current.filter((item) => item.id !== id)
      );

      window.alert(
        `Gudang "${nama}" berhasil dihapus.`
      );
    } catch (err) {
      console.error("Gagal menghapus gudang:", err);

      window.alert(
        err?.message ||
          "Gagal menghapus gudang."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleReset() {
    setSearch("");
    setStatusFilter("Semua");
  }

  function toggleSidebar() {
    setIsCollapsed((current) => !current);
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-col overflow-hidden transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >
        <div className="z-30 flex-shrink-0">
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

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1600px] space-y-5">

              {/* HEADER */}
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                    <Warehouse size={21} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-slate-900">
                      Master Gudang
                    </h1>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Kelola data gudang penyimpanan sarana dan prasarana sekolah
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadGudang(true)}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-lg hover:shadow-blue-200"
                  >
                    <Plus size={17} />
                    Tambah Gudang
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <XCircle
                    size={19}
                    className="mt-0.5 flex-shrink-0 text-rose-500"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-rose-700">
                      Gagal memuat data
                    </p>

                    <p className="mt-1 text-sm text-rose-600">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => loadGudang()}
                      className="mt-3 text-sm font-semibold text-rose-700 underline underline-offset-2"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              )}

              {/* STATISTIK */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Total Gudang
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {totalGudang}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Boxes size={19} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Gudang Aktif
                      </p>

                      <p className="mt-1 text-2xl font-bold text-emerald-600">
                        {gudangAktif}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={19} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Gudang Nonaktif
                      </p>

                      <p className="mt-1 text-2xl font-bold text-rose-600">
                        {gudangNonaktif}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <XCircle size={19} />
                    </div>
                  </div>
                </div>

              </div>

              {/* FILTER */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari nama atau lokasi gudang..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 lg:w-[180px]"
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

                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">

                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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

                    <tbody>

                      {loading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-16 text-center"
                          >
                            <div className="flex flex-col items-center">
                              <Loader2
                                size={28}
                                className="animate-spin text-blue-600"
                              />

                              <p className="mt-3 text-sm text-slate-500">
                                Memuat data gudang...
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredGudang.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-16 text-center"
                          >
                            <div className="flex flex-col items-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                                <Warehouse
                                  size={28}
                                  className="text-blue-300"
                                />
                              </div>

                              <p className="mt-3 text-sm font-semibold text-slate-600">
                                Belum ada gudang
                              </p>

                              <p className="mt-1 max-w-sm text-xs text-slate-400">
                                {search ||
                                statusFilter !== "Semua"
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
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                  >
                                    <Plus size={16} />
                                    Tambah Gudang
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ) : (
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
                                className={`border-b border-slate-100 last:border-0 transition hover:bg-blue-50/70 ${
                                  index % 2 === 0
                                    ? "bg-slate-50/40"
                                    : "bg-white"
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                      <Warehouse
                                        size={17}
                                      />
                                    </div>

                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {item?.nama ||
                                          "-"}
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-400">
                                        Gudang Sarpras
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin
                                      size={15}
                                      className="text-slate-400"
                                    />

                                    <span>
                                      {item?.lokasi ||
                                        "Tidak ada lokasi"}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  {status ===
                                  "aktif" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-600">
                                      <CheckCircle2
                                        size={14}
                                      />
                                      Aktif
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600">
                                      <XCircle
                                        size={14}
                                      />
                                      Nonaktif
                                    </span>
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-center gap-1">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/sarpras/gudang/master/edit/${item.id}`
                                        )
                                      }
                                      className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                      title="Edit Gudang"
                                    >
                                      <Edit
                                        size={16}
                                      />
                                    </button>

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
                                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
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

              <footer className="border-t border-slate-200/70 py-4 text-center text-[11px] text-slate-400">
                © 2026 SmartSchool • Master Gudang Sarana & Prasarana
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}