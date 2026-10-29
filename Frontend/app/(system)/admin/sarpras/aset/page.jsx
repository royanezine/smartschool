"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getAset, deleteAset } from "@/services/sarpras.service";

const kondisiConfig = {
  baik: {
    label: "Baik",
    icon: CheckCircle,
    textClassName: "theme-success",
  },
  rusak_ringan: {
    label: "Rusak Ringan",
    icon: AlertTriangle,
    textClassName: "theme-warning",
  },
  rusak_berat: {
    label: "Rusak Berat",
    icon: XCircle,
    textClassName: "theme-danger",
  },
};

const statusConfig = {
  tersedia: {
    label: "Tersedia",
    textClassName: "theme-info",
  },
  aktif: {
    label: "Aktif",
    textClassName: "theme-info",
  },
  dipinjam: {
    label: "Dipinjam",
    textClassName: "theme-primary",
  },
  perbaikan: {
    label: "Perbaikan",
    textClassName: "theme-text-muted",
  },
  nonaktif: {
    label: "Nonaktif",
    textClassName: "theme-text-muted",
  },
};

function formatTanggal(raw) {
  if (!raw) return "-";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(raw);
  }
}

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeWarningHover =
  "hover:bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] hover:text-[var(--color-warning)]";

const themeDangerHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_7px_20px_color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_7px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryGradientHover =
  "hover:brightness-95";

const themeRowSoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]";

export default function AdminSarprasAsetPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aset, setAset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const response = await getAset();
      const rawList =
        response?.data && Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

      setAset(rawList);
    } catch (err) {
      console.error("Gagal memuat data aset dari server:", err);
      setError(
        err?.message || "Gagal memuat data aset. Pastikan server backend berjalan."
      );
      setAset([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, []);

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${nama}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteAset(id);
      setAset((prev) => prev.filter((item) => item.id !== id));
      alert(`Aset "${nama}" berhasil dihapus dari server!`);
    } catch (err) {
      console.error("Gagal menghapus aset:", err);
      alert(err?.message || `Gagal menghapus aset "${nama}".`);
    } finally {
      setDeletingId(null);
    }
  };

  const kategoriKeys = useMemo(() => {
    const setKat = new Set();
    for (const item of aset) {
      const katName =
        item?.kategoriAset?.nama ||
        item?.kategori ||
        "";
      if (katName) setKat.add(katName);
    }
    return Array.from(setKat).sort();
  }, [aset]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return aset
      .filter((item) => {
        const nama = String(item?.nama || "").toLowerCase();
        const kode = String(item?.kode || item?.kode_aset || "").toLowerCase();
        const lokasi = String(item?.lokasi || item?.gudang?.nama || "").toLowerCase();
        const kategori = String(
          item?.kategoriAset?.nama || item?.kategori || ""
        );
        const kondisi = String(item?.kondisi || "").toLowerCase();

        const matchSearch =
          !keyword ||
          nama.includes(keyword) ||
          kode.includes(keyword) ||
          lokasi.includes(keyword) ||
          kategori.toLowerCase().includes(keyword);

        const matchKategori =
          kategoriFilter === "Semua" || kategori === kategoriFilter;

        const matchKondisi =
          kondisiFilter === "Semua" || kondisi === kondisiFilter;

        return matchSearch && matchKategori && matchKondisi;
      })
      .sort((a, b) => {
        const katA = String(a?.kategoriAset?.nama || a?.kategori || "");
        const katB = String(b?.kategoriAset?.nama || b?.kategori || "");
        const namaA = String(a?.nama || "");
        const namaB = String(b?.nama || "");
        return katA.localeCompare(katB) || namaA.localeCompare(namaB);
      });
  }, [aset, search, kategoriFilter, kondisiFilter]);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarprasAset"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
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

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-xl p-2.5 ${themePrimaryGradient} ${themePrimaryShadow}`}
                  >
                    <Boxes
                      size={20}
                      className="text-[var(--color-card)]"
                    />
                  </div>

                  <div>
                    <h1 className="theme-text text-xl font-semibold">
                      Aset Sarana & Prasarana
                    </h1>

                    <p className="theme-text-secondary text-sm">
                      Kelola aset tetap, fasilitas, dan kondisi barang sekolah
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <button
                    onClick={() => loadData(true)}
                    disabled={loading || refreshing}
                    className={`theme-card theme-border ${themeNeutralHover} rounded-xl border p-2.5 transition-all ${themeCardShadow} ${themeCardHoverShadow} disabled:opacity-50`}
                    title="Refresh Data dari Server"
                  >
                    <RefreshCw
                      size={17}
                      className={`theme-text-secondary ${refreshing ? "animate-spin" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/gudang/tambah"
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-all ${themePrimaryGradient} ${themePrimaryGradientHover} ${themePrimaryShadow}`}
                  >
                    <Plus
                      size={18}
                      className="text-[var(--color-card)]"
                    />

                    <span className="text-[var(--color-card)]">
                      Tambah Aset
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                  <AlertCircle size={18} className="shrink-0 text-rose-500" />
                  <div className="flex-1">
                    <p className="font-semibold">Gagal memuat data aset</p>
                    <p className="mt-0.5 text-rose-600">{error}</p>
                  </div>
                  <button
                    onClick={() => loadData(true)}
                    className="rounded-lg bg-rose-100 px-3 py-1 font-semibold text-rose-700 hover:bg-rose-200"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              <div
                className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row">

                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      placeholder="Cari nama aset, kode, atau lokasi..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className={`theme-input theme-text w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Filter
                      size={17}
                      className="theme-text-muted"
                    />

                    <select
                      value={kategoriFilter}
                      onChange={(e) =>
                        setKategoriFilter(e.target.value)
                      }
                      className={`theme-input theme-text min-w-[140px] cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition ${themeFocus}`}
                    >
                      <option value="Semua">
                        Semua Kategori
                      </option>

                      {kategoriKeys.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>

                    <select
                      value={kondisiFilter}
                      onChange={(e) =>
                        setKondisiFilter(e.target.value)
                      }
                      className={`theme-input theme-text min-w-[140px] cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition ${themeFocus}`}
                    >
                      <option value="Semua">
                        Semua Kondisi
                      </option>

                      <option value="baik">
                        Baik
                      </option>

                      <option value="rusak_ringan">
                        Rusak Ringan
                      </option>

                      <option value="rusak_berat">
                        Rusak Berat
                      </option>
                    </select>

                    <button
                      onClick={() => {
                        setSearch("");
                        setKategoriFilter("Semua");
                        setKondisiFilter("Semua");
                      }}
                      className={`theme-text-secondary ${themeNeutralHover} rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors`}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`theme-card theme-border overflow-hidden rounded-xl border ${themeCardShadow}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-sm">

                    <thead>
                      <tr
                        className={`text-[var(--color-card)] ${themePrimaryGradient}`}
                      >
                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          No.
                        </th>

                        <th className="min-w-[200px] px-4 py-3 text-left font-semibold">
                          Nama Aset
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Kategori
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Kode Aset
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Lokasi
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                          Jumlah
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Kondisi
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Status
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Penanggung Jawab
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                          Tgl. Pengadaan
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={11} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Loader2
                                size={28}
                                className="animate-spin text-[var(--color-primary)]"
                              />
                              <p className="theme-text mt-3 text-sm font-semibold">
                                Memuat data aset dari server...
                              </p>
                              <p className="theme-text-muted mt-1 text-xs">
                                Mengambil data sarana & prasarana terkini
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item, idx) => {
                          const rawKondisi = String(item?.kondisi || "baik").toLowerCase();
                          const kondisi =
                            kondisiConfig[rawKondisi] || kondisiConfig.baik;

                          const rawStatus = String(item?.status || "tersedia").toLowerCase();
                          const status =
                            statusConfig[rawStatus] || {
                              label: item?.status || "Tersedia",
                              textClassName: "theme-info",
                            };

                          const KondisiIcon =
                            kondisi.icon || CheckCircle;

                          const kategoriName =
                            item?.kategoriAset?.nama ||
                            item?.kategori ||
                            "-";

                          const kodeAset =
                            item?.kode ||
                            item?.kode_aset ||
                            "-";

                          const lokasiAset =
                            item?.lokasi ||
                            item?.gudang?.nama ||
                            "-";

                          const jumlahAset =
                            item?.jumlahStok !== undefined && item?.jumlahStok !== null
                              ? item.jumlahStok
                              : item?.jumlah ?? 0;

                          const tglPengadaan = formatTanggal(
                            item?.tanggalPembelian || item?.tanggal_pengadaan
                          );

                          const penanggungJawab =
                            item?.penanggung_jawab ||
                            item?.gudang?.nama ||
                            "-";

                          const isDeleting = deletingId === item.id;

                          return (
                            <tr
                              key={item.id}
                              className={`theme-border border-b last:border-0 transition-colors ${themePrimarySoftHover} ${
                                idx % 2 === 0
                                  ? themeRowSoft
                                  : ""
                              } ${isDeleting ? "opacity-50" : ""}`}
                            >
                              <td className="theme-text-secondary px-4 py-2.5 font-medium">
                                {idx + 1}
                              </td>

                              <td className="theme-text px-4 py-2.5 font-semibold">
                                {item.nama}
                              </td>

                              <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                                {kategoriName}
                              </td>

                              <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                                {kodeAset}
                              </td>

                              <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                                {lokasiAset}
                              </td>

                              <td className="theme-text whitespace-nowrap px-4 py-2.5 text-center font-medium">
                                {jumlahAset} unit
                              </td>

                              <td className="whitespace-nowrap px-4 py-2.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${kondisi.textClassName}`}
                                >
                                  <KondisiIcon size={14} />
                                  {kondisi.label}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-4 py-2.5">
                                <span
                                  className={`text-sm font-medium ${status.textClassName}`}
                                >
                                  {status.label}
                                </span>
                              </td>

                              <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                                {penanggungJawab}
                              </td>

                              <td className="theme-text-secondary whitespace-nowrap px-4 py-2.5">
                                {tglPengadaan}
                              </td>

                              <td className="px-4 py-2.5">
                                <div className="flex items-center justify-center gap-1.5">

                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/admin/sarpras/gudang/edit/${item.id}`
                                      )
                                    }
                                    className={`theme-text-muted rounded-lg p-2 transition-all ${themeWarningHover}`}
                                    title="Edit Aset"
                                  >
                                    <Edit size={16} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDelete(
                                        item.id,
                                        item.nama
                                      )
                                    }
                                    disabled={isDeleting}
                                    className={`theme-text-muted rounded-lg p-2 transition-all ${themeDangerHover} disabled:opacity-40`}
                                    title="Hapus Aset"
                                  >
                                    {isDeleting ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>

                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={11}
                            className="px-4 py-12 text-center"
                          >
                            <div className="mb-3 flex justify-center">
                              <div
                                className={`rounded-full p-3 ${themePrimarySoft}`}
                              >
                                <Boxes
                                  size={36}
                                  className="theme-primary"
                                />
                              </div>
                            </div>

                            <p className="theme-text-secondary text-sm font-medium">
                              Tidak ada data aset
                            </p>

                            <p className="theme-text-muted mt-1 text-xs">
                              {search ||
                              kategoriFilter !== "Semua" ||
                              kondisiFilter !== "Semua"
                                ? "Coba ubah filter pencarian"
                                : "Silakan tambahkan aset baru"}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <footer className="theme-border theme-text-muted border-t py-3 text-center text-[11px]">
                © 2026 SmartSchool • Aset Sarana & Prasarana
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}