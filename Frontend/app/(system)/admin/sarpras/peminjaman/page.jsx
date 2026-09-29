"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  Package,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserRound,
  CalendarDays,
  AlertCircle,
  Loader2,
  Check,
  HandCoins,
  Undo2,
  RefreshCw,
} from "lucide-react";

import { getDaftarPeminjaman } from "../../../../../services/sarpras.service";

/* =========================================================
   CONSTANT
========================================================= */

const STATUS = {
  MENUNGGU: "menunggu_persetujuan",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
  DIPINJAM: "dipinjam",
  DIKEMBALIKAN: "dikembalikan",
};

const getStatusConfig = (status) => {
  switch (status) {
    case STATUS.MENUNGGU:
      return {
        label: "Menunggu",
        className: "bg-amber-50 text-amber-700 border-amber-200/70",
        icon: Clock3,
        dot: "bg-amber-500",
      };
    case STATUS.DISETUJUI:
      return {
        label: "Disetujui",
        className: "bg-blue-50 text-blue-700 border-blue-200/70",
        icon: CheckCircle2,
        dot: "bg-blue-500",
      };
    case STATUS.DITOLAK:
      return {
        label: "Ditolak",
        className: "bg-red-50 text-red-700 border-red-200/70",
        icon: XCircle,
        dot: "bg-red-500",
      };
    case STATUS.DIPINJAM:
      return {
        label: "Dipinjam",
        className: "bg-violet-50 text-violet-700 border-violet-200/70",
        icon: Package,
        dot: "bg-violet-500",
      };
    case STATUS.DIKEMBALIKAN:
      return {
        label: "Dikembalikan",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
        icon: RotateCcw,
        dot: "bg-emerald-500",
      };
    default:
      return {
        label: status || "-",
        className: "bg-slate-50 text-slate-600 border-slate-200",
        icon: ClipboardList,
        dot: "bg-slate-400",
      };
  }
};

/* =========================================================
   HELPERS
========================================================= */

const formatTanggal = (value) => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const getPaginationData = (response) => {
  const data = response?.data ?? response;
  return {
    items: Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [],
    total:
      Number(
        response?.pagination?.total ??
          response?.meta?.total ??
          data?.pagination?.total ??
          data?.meta?.total ??
          0
      ) || 0,
  };
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminSarprasPeminjamanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [daftarPeminjaman, setDaftarPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [pencarian, setPencarian] = useState("");
  const [statusAktif, setStatusAktif] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalData, setTotalData] = useState(0);

  const notifications = [
    {
      id: 1,
      title: "Peminjaman Sarpras",
      desc: "Kelola pengajuan peminjaman aset sekolah",
      read: false,
    },
  ];

  /* LOAD DATA */
  const loadPeminjaman = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const response = await getDaftarPeminjaman({
          page,
          limit,
          status: statusAktif,
          search: pencarian,
        });

        const result = getPaginationData(response);
        setDaftarPeminjaman(result.items);
        setTotalData(result.total);
      } catch (err) {
        console.error("Gagal mengambil daftar peminjaman:", err);
        setError(err?.message || "Gagal mengambil data peminjaman.");
        setDaftarPeminjaman([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, statusAktif, pencarian]
  );

  useEffect(() => {
    loadPeminjaman(false);
  }, [loadPeminjaman]);

  /* SEARCH DEBOUNCE */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [pencarian]);

  const handleRefresh = () => {
    if (loading || refreshing) return;
    loadPeminjaman(true);
  };

  /* SUMMARY */
  const summary = useMemo(() => {
    return {
      total: daftarPeminjaman.length,
      menunggu: daftarPeminjaman.filter((i) => i.status === STATUS.MENUNGGU)
        .length,
      disetujui: daftarPeminjaman.filter((i) => i.status === STATUS.DISETUJUI)
        .length,
      dipinjam: daftarPeminjaman.filter((i) => i.status === STATUS.DIPINJAM)
        .length,
      selesai: daftarPeminjaman.filter(
        (i) => i.status === STATUS.DIKEMBALIKAN
      ).length,
    };
  }, [daftarPeminjaman]);

  const totalPages = Math.max(1, Math.ceil(totalData / limit));

  /* NAVIGATE */
  const bukaDetail = (item) => {
    if (!item?.id) return;
    router.push(`/admin/sarpras/peminjaman/${item.id}`);
  };

  const bukaAksi = (type, item) => {
    if (!item?.id) return;
    router.push(
      `/admin/sarpras/peminjaman/${item.id}/aksi?type=${type}`
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex flex-1 min-w-0 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                  <ClipboardList size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
                    Peminjaman Sarana Prasarana
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Kelola pengajuan, penyerahan, dan pengembalian aset sekolah.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#60A5FA]/30 bg-white px-4 text-sm font-semibold text-[#1E3A5F] shadow-sm transition-all hover:border-[#2563EB] hover:bg-[#2563EB]/5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RefreshCw
                  size={15}
                  className={loading || refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </section>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <SummaryCard
                icon={ClipboardList}
                label="Total"
                value={summary.total}
                tone="blue"
              />
              <SummaryCard
                icon={Clock3}
                label="Menunggu"
                value={summary.menunggu}
                tone="amber"
              />
              <SummaryCard
                icon={CheckCircle2}
                label="Disetujui"
                value={summary.disetujui}
                tone="blue"
              />
              <SummaryCard
                icon={Package}
                label="Dipinjam"
                value={summary.dipinjam}
                tone="violet"
              />
              <SummaryCard
                icon={RotateCcw}
                label="Selesai"
                value={summary.selesai}
                tone="emerald"
              />
            </section>

            {/* =================================================
                FILTER
            ================================================= */}

            <section className="rounded-xl border border-[#60A5FA]/20 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-md">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={pencarian}
                    onChange={(e) => setPencarian(e.target.value)}
                    placeholder="Cari nomor peminjaman, keperluan, atau siswa..."
                    className="h-11 w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] pl-10 pr-3 text-sm text-[#0F172A] outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15 transition-colors"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { label: "Semua", value: "" },
                    { label: "Menunggu", value: STATUS.MENUNGGU },
                    { label: "Disetujui", value: STATUS.DISETUJUI },
                    { label: "Dipinjam", value: STATUS.DIPINJAM },
                    { label: "Selesai", value: STATUS.DIKEMBALIKAN },
                    { label: "Ditolak", value: STATUS.DITOLAK },
                  ].map((filter) => {
                    const aktif = statusAktif === filter.value;
                    return (
                      <button
                        key={filter.value || "semua"}
                        type="button"
                        onClick={() => {
                          setStatusAktif(filter.value);
                          setPage(1);
                        }}
                        className={`inline-flex items-center h-10 whitespace-nowrap rounded-lg border px-3.5 text-xs font-semibold transition-colors ${
                          aktif
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "border-[#60A5FA]/25 bg-white text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB]"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200/70 bg-red-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 flex-shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-800">Gagal memuat data</p>
                  <p className="mt-1 text-xs text-red-700/80">{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                TABLE
            ================================================= */}

            <section
              className={`overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm transition-opacity duration-200 ${
                refreshing ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              {loading ? (
                <div className="flex min-h-[380px] flex-col items-center justify-center">
                  <Loader2 size={26} className="animate-spin text-[#2563EB]" />
                  <p className="mt-3 text-sm text-slate-500">
                    Memuat data peminjaman...
                  </p>
                </div>
              ) : daftarPeminjaman.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#60A5FA]/15 bg-[#F8FAFC]">
                        <th className="w-14 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Peminjaman
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Peminjam
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Aset
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Tgl Kembali
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </th>
                        <th className="w-48 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {daftarPeminjaman.map((item, index) => {
                        const cfg = getStatusConfig(item.status);
                        const nomor = (page - 1) * limit + index + 1;

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-[#60A5FA]/10 transition hover:bg-[#F8FAFC]"
                          >
                            <td className="px-4 py-4 text-center text-xs font-semibold text-slate-400">
                              {nomor}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                                  <ClipboardList size={15} />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-[#0F172A]">
                                    {item.nomorPeminjaman || "-"}
                                  </p>
                                  <p className="mt-1 max-w-[230px] truncate text-[11px] text-slate-400">
                                    {item.keperluan || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                                  <UserRound size={13} />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-[#0F172A]">
                                    {item.peminjam?.namaLengkap || "-"}
                                  </p>
                                  <p className="text-[10px] text-slate-400">
                                    {item.peminjam?.nip ||
                                      item.peminjam?.email ||
                                      "Guru"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                {item.detailPeminjaman?.slice(0, 2).map((d) => (
                                  <div
                                    key={d.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Package
                                      size={12}
                                      className="shrink-0 text-[#2563EB]"
                                    />
                                    <span className="max-w-[180px] truncate text-xs text-[#0F172A]">
                                      {d.aset?.nama || "-"}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      ×{d.jumlah}
                                    </span>
                                  </div>
                                ))}
                                {item.detailPeminjaman?.length > 2 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{item.detailPeminjaman.length - 2} aset lainnya
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={13}
                                  className="text-slate-400"
                                />
                                <span className="text-xs text-slate-600">
                                  {formatTanggal(item.tanggalKembaliRencana)}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => bukaDetail(item)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#60A5FA]/25 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-[#2563EB] hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                                >
                                  <Eye size={13} />
                                  Detail
                                </button>

                                {item.status === STATUS.MENUNGGU && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => bukaAksi("tolak", item)}
                                      className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-red-600 transition hover:bg-red-100"
                                      title="Tolak"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => bukaAksi("setujui", item)}
                                      className="inline-flex h-8 items-center justify-center rounded-lg bg-[#2563EB] px-2.5 text-white transition hover:bg-[#1E3A5F]"
                                      title="Setujui"
                                    >
                                      <Check size={14} />
                                    </button>
                                  </>
                                )}

                                {item.status === STATUS.DISETUJUI && (
                                  <button
                                    type="button"
                                    onClick={() => bukaAksi("serahkan", item)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#2563EB] px-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1E3A5F]"
                                  >
                                    <HandCoins size={13} />
                                    Serahkan
                                  </button>
                                )}

                                {item.status === STATUS.DIPINJAM && (
                                  <button
                                    type="button"
                                    onClick={() => bukaAksi("kembalikan", item)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-emerald-700"
                                  >
                                    <Undo2 size={13} />
                                    Kembalikan
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION */}
              {!loading && daftarPeminjaman.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-[#60A5FA]/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-slate-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-600">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-slate-600">
                      {Math.min(page * limit, totalData || page * limit)}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-600">
                      {totalData}
                    </span>{" "}
                    data
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((v) => Math.max(1, v - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#60A5FA]/25 text-slate-500 transition hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#2563EB]/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="px-3 text-xs font-semibold text-slate-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((v) => Math.min(totalPages, v + 1))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#60A5FA]/25 text-slate-500 transition hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#2563EB]/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SUB COMPONENTS
========================================================= */

function SummaryCard({ icon: Icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "bg-[#2563EB]/10 border-[#2563EB]/20 text-[#2563EB]",
    amber: "bg-amber-50 border-amber-200/70 text-amber-600",
    violet: "bg-violet-50 border-violet-200/70 text-violet-600",
    emerald: "bg-emerald-50 border-emerald-200/70 text-emerald-600",
    red: "bg-red-50 border-red-200/70 text-red-600",
  };

  return (
    <div className="rounded-xl border border-[#60A5FA]/20 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-[#0F172A]">
            {value}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
            tones[tone] || tones.blue
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = getStatusConfig(status);
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#60A5FA]/20 bg-[#F8FAFC] text-[#60A5FA]">
        <ClipboardList size={22} />
      </div>
      <p className="mt-4 text-sm font-bold text-[#0F172A]">
        Belum ada data peminjaman
      </p>
      <p className="mt-1 max-w-sm text-xs text-slate-500">
        Pengajuan peminjaman dari guru akan muncul di halaman ini.
      </p>
    </div>
  );
}