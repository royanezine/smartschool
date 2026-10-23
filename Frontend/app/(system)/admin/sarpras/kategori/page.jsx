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
  Layers3,
  ChevronRight,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriAset,
  deleteKategoriAset,
} from "@/services/sarpras.service";


function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.result?.data)) return response.result.data;
  return [];
}


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(err?.message || "Gagal mengambil data kategori aset.");
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

      setKategoriList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
      setError(err?.message || "Gagal menghapus kategori aset.");
    } finally {
      setDeleting(null);
    }
  }


  const filteredKategori = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return kategoriList.filter((item) => {
      const nama = String(item?.nama || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();

      const matchSearch = !keyword || nama.includes(keyword);
      const matchStatus =
        filterStatus === "semua" || status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [kategoriList, search, filterStatus]);


  const totalKategori = kategoriList.length;

  const kategoriAktif = kategoriList.filter(
    (item) => String(item?.status || "").toLowerCase() === "aktif"
  ).length;

  const kategoriNonaktif = kategoriList.filter(
    (item) => String(item?.status || "").toLowerCase() === "nonaktif"
  ).length;


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} sm:h-14 sm:w-14`}
                >
                  <Tag size={24} strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Sarana & Prasarana
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider theme-text-muted">
                      · Master Data
                    </span>
                  </div>

                  <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-[26px]">
                    Kategori Aset
                  </h1>

                  <p className="theme-text-secondary mt-1 max-w-2xl text-sm leading-6">
                    Kelola kategori untuk mengelompokkan barang inventaris
                    sekolah dengan lebih terstruktur.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/sarpras/kategori/tambah"
                className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] transition-all ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-[1.04] active:scale-[0.98]`}
              >
                <Plus size={18} />
                Tambah Kategori
              </Link>
            </div>


            {error && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} theme-danger ${themeSmallShadow}`}
                >
                  <AlertCircle size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-bold">
                    Terjadi Kesalahan
                  </p>
                  <p className="theme-text-secondary mt-1 break-words text-sm leading-5">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadKategori}
                  className={`theme-text-secondary shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition ${themeNeutralHover} hover:text-[var(--color-text)]`}
                >
                  Coba lagi
                </button>
              </div>
            )}


            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                icon={Layers3}
                label="Total Kategori"
                value={totalKategori}
                description="Seluruh kategori aset"
                tone="primary"
              />
              <StatCard
                icon={CheckCircle2}
                label="Kategori Aktif"
                value={kategoriAktif}
                description="Siap digunakan pada aset"
                tone="success"
              />
              <StatCard
                icon={XCircle}
                label="Kategori Nonaktif"
                value={kategoriNonaktif}
                description="Tidak digunakan sementara"
                tone="neutral"
              />
            </div>


            <div
              className={`theme-card overflow-hidden rounded-2xl border theme-border ${themeCardShadow}`}
            >
              <div className="border-b theme-border px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)]`}
                    >
                      <Tag size={18} />
                    </div>
                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Daftar Kategori
                      </h2>
                      <p className="theme-text-muted mt-0.5 text-xs">
                        {filteredKategori.length} dari {totalKategori}{" "}
                        kategori ditampilkan
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative min-w-0 flex-1 sm:min-w-[260px] lg:w-[280px] lg:flex-none">
                      <Search
                        size={16}
                        className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kategori..."
                        className={`theme-input h-10 w-full rounded-xl border ${themeNeutralBorder} pl-10 pr-4 text-sm font-medium outline-none transition ${themeFocus}`}
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`theme-input h-10 rounded-xl border ${themeNeutralBorder} px-3.5 text-sm font-medium outline-none transition ${themeFocus}`}
                    >
                      <option value="semua">Semua Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>

                    <button
                      type="button"
                      onClick={loadKategori}
                      disabled={loading}
                      className={`theme-card inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} px-3.5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                      />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                </div>
              </div>


              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} text-[var(--color-primary)]`}
                    >
                      <Loader2 size={25} className="animate-spin" />
                    </div>
                    <p className="theme-text mt-4 text-sm font-semibold">
                      Memuat kategori
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Mengambil data dari sistem...
                    </p>
                  </div>
                </div>
              ) : filteredKategori.length === 0 ? (

                <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
                  >
                    <Tag size={27} />
                  </div>

                  <h3 className="theme-text mt-5 text-base font-bold">
                    {kategoriList.length === 0
                      ? "Belum ada kategori"
                      : "Kategori tidak ditemukan"}
                  </h3>

                  <p className="theme-text-secondary mt-1.5 max-w-md text-sm leading-6">
                    {kategoriList.length === 0
                      ? "Tambahkan kategori aset terlebih dahulu agar dapat digunakan pada inventaris."
                      : "Tidak ada kategori yang sesuai dengan pencarian atau filter yang dipilih."}
                  </p>

                  {kategoriList.length === 0 && (
                    <Link
                      href="/admin/sarpras/kategori/tambah"
                      className={`mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition ${themePrimaryGradient} ${themePrimaryShadow}`}
                    >
                      <Plus size={17} />
                      Tambah Kategori
                    </Link>
                  )}
                </div>
              ) : (
                <>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[720px] table-fixed">
                      <colgroup>
                        <col className="w-[72px]" />
                        <col />
                        <col className="w-[170px]" />
                        <col className="w-[130px]" />
                      </colgroup>

                      <thead>
                        <tr className="border-b theme-border theme-card-soft">
                          <th className="theme-text-muted px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                            No
                          </th>
                          <th className="theme-text-muted px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                            Nama Kategori
                          </th>
                          <th className="theme-text-muted px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                            Status
                          </th>
                          <th className="theme-text-muted px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border)]">
                        {filteredKategori.map((item, index) => {
                          const aktif =
                            String(item?.status || "").toLowerCase() ===
                            "aktif";

                          return (
                            <tr
                              key={item.id}
                              className="group transition theme-table-hover"
                            >
                              <td className="px-6 py-4">
                                <span className="theme-text-muted text-xs font-semibold">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                                  >
                                    <Tag size={17} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-sm font-bold">
                                      {item.nama}
                                    </p>
                                    <p className="theme-text-muted mt-0.5 text-xs">
                                      Kategori inventaris
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {aktif ? (
                                  <span className="theme-success inline-flex items-center gap-2 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="theme-text-secondary inline-flex items-center gap-2 rounded-full border theme-border theme-card-soft px-3 py-1.5 text-xs font-semibold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    Nonaktif
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex justify-end gap-1.5">
                                  <Link
                                    href={`/admin/sarpras/kategori/edit/${item.id}`}
                                    className={`theme-text-muted inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:theme-card-soft hover:text-[var(--color-primary)]`}
                                    title="Edit kategori"
                                  >
                                    <Edit size={16} />
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(item.id, item.nama)
                                    }
                                    disabled={deleting === item.id}
                                    className={`theme-text-muted inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:theme-danger disabled:cursor-not-allowed disabled:opacity-50`}
                                    title="Hapus kategori"
                                  >
                                    {deleting === item.id ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>


                  <div className="divide-y divide-[var(--color-border)] md:hidden">
                    {filteredKategori.map((item, index) => {
                      const aktif =
                        String(item?.status || "").toLowerCase() === "aktif";

                      return (
                        <div
                          key={item.id}
                          className="p-4 transition theme-table-hover"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                            >
                              <Tag size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                                    Kategori #{index + 1}
                                  </p>
                                  <p className="theme-text mt-1 truncate text-sm font-bold">
                                    {item.nama}
                                  </p>
                                </div>

                                {aktif ? (
                                  <span className="theme-success shrink-0 rounded-full border theme-border px-2.5 py-1 text-[10px] font-bold">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="theme-text-secondary shrink-0 rounded-full border theme-border theme-card-soft px-2.5 py-1 text-[10px] font-bold">
                                    Nonaktif
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <Link
                                  href={`/admin/sarpras/kategori/edit/${item.id}`}
                                  className={`theme-text-secondary inline-flex h-9 items-center gap-2 rounded-lg border theme-border theme-card px-3 text-xs font-semibold transition hover:theme-card-soft hover:text-[var(--color-primary)]`}
                                >
                                  <Edit size={14} />
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(item.id, item.nama)
                                  }
                                  disabled={deleting === item.id}
                                  className={`theme-text-secondary inline-flex h-9 items-center gap-2 rounded-lg border theme-border theme-card px-3 text-xs font-semibold transition hover:theme-danger disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                  {deleting === item.id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}


              {!loading && filteredKategori.length > 0 && (
                <div className="flex flex-col gap-2 border-t theme-border theme-card-soft px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="theme-text-muted text-xs">
                    Menampilkan{" "}
                    <span className="theme-text font-semibold">
                      {filteredKategori.length}
                    </span>{" "}
                    kategori
                  </p>

                  <Link
                    href="/admin/sarpras/kategori/tambah"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:brightness-90"
                  >
                    Tambah kategori
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>


            <div className="mt-6 flex items-center justify-center gap-2 text-center">
              <div className="h-1 w-1 rounded-full bg-[var(--color-text-placeholder)]" />
              <p className="theme-text-muted text-[11px]">
                SmartSchool • Modul Sarana & Prasarana
              </p>
              <div className="h-1 w-1 rounded-full bg-[var(--color-text-placeholder)]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function StatCard({ icon: Icon, label, value, description, tone = "primary" }) {
  const toneMap = {
    primary: {
      bg: themePrimarySoft,
      icon: "text-[var(--color-primary)]",
    },
    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      icon: "text-[var(--color-success)]",
    },
    neutral: {
      bg: themeNeutralSurface,
      icon: "theme-text-muted",
    },
  };

  const style = toneMap[tone] || toneMap.primary;

  return (
    <div
      className={`theme-card group rounded-xl border theme-border p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-2 text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>

          <p className="theme-text-muted mt-1 text-xs">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.icon}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}