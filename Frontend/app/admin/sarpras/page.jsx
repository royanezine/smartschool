"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DoorOpen,
  Package,
  Wrench,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Plus,
  Search,
  RefreshCw,
  Boxes,
  School,
  LayoutGrid,
  ChevronRight,
  Clock3,
  CheckCircle2,
  CircleAlert,
  TrendingUp,
  MapPin,
  FileText,
} from "lucide-react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import { getGedung } from "../../../services/infrastruktur.service";

export default function SarprasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gedung, setGedung] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const loadData = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      const response = await getGedung();

      if (response?.success === false) {
        setError(
          response?.message || "Data gedung belum dapat dimuat."
        );
        setGedung([]);
        return;
      }

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.result)) {
        data = response.result;
      }

      setGedung(data);
    } catch (err) {
      console.error("Gagal memuat data sarpras:", err);

      setError(
        err?.message || "Terjadi kesalahan saat memuat data."
      );

      setGedung([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGedung = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return gedung;
    }

    return gedung.filter((item) => {
      const nama = String(
        item?.nama ||
          item?.namaGedung ||
          item?.nama_gedung ||
          ""
      ).toLowerCase();

      const kode = String(
        item?.kode ||
          item?.kodeGedung ||
          item?.kode_gedung ||
          ""
      ).toLowerCase();

      const lokasi = String(
        item?.lokasi ||
          item?.alamat ||
          ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        kode.includes(keyword) ||
        lokasi.includes(keyword)
      );
    });
  }, [gedung, search]);

  const totalGedung = gedung.length;

  const totalAktif = gedung.filter((item) => {
    const status = String(
      item?.status ||
        item?.statusGedung ||
        "aktif"
    ).toLowerCase();

    return status === "aktif";
  }).length;

  const totalTidakAktif = Math.max(
    totalGedung - totalAktif,
    0
  );

  const menuItems = [
    {
      title: "Gedung & Ruangan",
      description:
        "Kelola gedung, lantai, dan ruangan sekolah",
      icon: Building2,
      href: "/admin/sarpras/gedung",
      stat: `${totalGedung} Gedung`,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Inventaris",
      description:
        "Kelola barang dan aset inventaris sekolah",
      icon: Package,
      href: "/admin/sarpras/gudang",
      stat: "Kelola Aset",
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      title: "Fasilitas",
      description:
        "Kelola fasilitas dan perlengkapan sekolah",
      icon: Boxes,
      href: "/admin/sarpras/fasilitas",
      stat: "Kelola Fasilitas",
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Peminjaman",
      description:
        "Pantau dan kelola peminjaman barang",
      icon: ClipboardList,
      href: "/admin/sarpras/peminjaman",
      stat: "Kelola Peminjaman",
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Pemeliharaan",
      description:
        "Kelola perawatan dan pemeliharaan fasilitas",
      icon: Wrench,
      href: "/admin/sarpras/pemeliharaan",
      stat: "Kelola Perawatan",
      iconClass: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Laporan Kerusakan",
      description:
        "Catat dan tindak lanjuti laporan kerusakan",
      icon: AlertTriangle,
      href: "/admin/sarpras/kerusakan",
      stat: "Lihat Laporan",
      iconClass: "bg-rose-50 text-rose-600",
    },
  ];

  const quickActions = [
    {
      title: "Tambah Gedung",
      description: "Tambahkan gedung baru",
      icon: Building2,
      href: "/admin/sarpras/gedung/tambah",
    },
    {
      title: "Tambah Inventaris",
      description: "Tambahkan aset inventaris",
      icon: Package,
      href: "/admin/sarpras/gudang/tambah",
    },
    {
      title: "Ajukan Peminjaman",
      description: "Buat data peminjaman",
      icon: ClipboardList,
      href: "/admin/sarpras/peminjaman/tambah",
    },
    {
      title: "Laporan Kerusakan",
      description: "Buat laporan kerusakan",
      icon: CircleAlert,
      href: "/admin/sarpras/kerusakan/tambah",
    },
  ];

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      {/* SIDEBAR */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* AREA KANAN */}
      <div
        className={`flex h-screen min-w-0 flex-col transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >
        {/* HEADER */}
        <div className="shrink-0">
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

        {/* CONTENT SAJA YANG SCROLL */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">

              {/* PAGE HEADER */}
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <span>Admin</span>

                    <ChevronRight size={15} />

                    <span className="font-medium text-[#2563EB]">
                      Sarana & Prasarana
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                    Sarana & Prasarana
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Kelola gedung, ruangan, inventaris,
                    fasilitas, peminjaman, dan
                    pemeliharaan sarana sekolah.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={isRefreshing}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        isRefreshing
                          ? "animate-spin"
                          : ""
                      }
                    />

                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/gedung/tambah"
                      )
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
                  >
                    <Plus size={17} />

                    Tambah Gedung
                  </button>
                </div>
              </div>

              {/* STATISTICS */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Gedung"
                  value={
                    isLoading
                      ? "..."
                      : totalGedung
                  }
                  description="Gedung terdaftar"
                  icon={Building2}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  trend="Data real-time"
                />

                <StatCard
                  title="Gedung Aktif"
                  value={
                    isLoading
                      ? "..."
                      : totalAktif
                  }
                  description="Dalam kondisi aktif"
                  icon={CheckCircle2}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  trend="Status aktif"
                />

                <StatCard
                  title="Tidak Aktif"
                  value={
                    isLoading
                      ? "..."
                      : totalTidakAktif
                  }
                  description="Perlu diperiksa"
                  icon={CircleAlert}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  trend="Perlu perhatian"
                />

                <StatCard
                  title="Modul Sarpras"
                  value="6"
                  description="Menu pengelolaan"
                  icon={LayoutGrid}
                  iconBg="bg-violet-50"
                  iconColor="text-violet-600"
                  trend="Terintegrasi"
                />
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <CircleAlert
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Data belum dapat dimuat
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadData()}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-medium text-amber-700 hover:bg-amber-100"
                  >
                    <RefreshCw size={15} />

                    Coba Lagi
                  </button>
                </div>
              )}

              {/* AKSI CEPAT */}
              <section className="mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    Aksi Cepat
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Akses fitur Sarpras yang sering digunakan
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() =>
                          router.push(action.href)
                        }
                        className="group flex min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition group-hover:bg-[#2563EB] group-hover:text-white">
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {action.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {action.description}
                          </p>
                        </div>

                        <ArrowRight
                          size={17}
                          className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* MAIN CONTENT */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]">

                {/* MODUL SARPRAS */}
                <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-[#0F172A]">
                          Pengelolaan Sarpras
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Pilih modul yang ingin dikelola
                        </p>
                      </div>

                      <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 lg:w-[250px]">
                        <Search
                          size={16}
                          className="shrink-0 text-slate-400"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Cari gedung..."
                          className="ml-2 min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
                    {menuItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() =>
                            router.push(item.href)
                          }
                          className="group flex min-h-[125px] flex-col rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
                            >
                              <Icon size={19} />
                            </div>

                            <ArrowRight
                              size={17}
                              className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]"
                            />
                          </div>

                          <div className="mt-4">
                            <h3 className="text-sm font-bold text-slate-800">
                              {item.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {item.description}
                            </p>

                            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2563EB]">
                              <span>{item.stat}</span>

                              <ChevronRight size={13} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* RINGKASAN */}
                <div className="space-y-6">
                  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <School size={19} />
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-[#0F172A]">
                            Ringkasan Sarpras
                          </h2>

                          <p className="text-xs text-slate-500">
                            Informasi pengelolaan fasilitas
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                      <SummaryRow
                        icon={Building2}
                        label="Gedung"
                        value={
                          isLoading
                            ? "..."
                            : totalGedung
                        }
                      />

                      <SummaryRow
                        icon={DoorOpen}
                        label="Ruangan"
                        value="—"
                      />

                      <SummaryRow
                        icon={Package}
                        label="Inventaris"
                        value="—"
                      />

                      <SummaryRow
                        icon={Wrench}
                        label="Pemeliharaan"
                        value="—"
                      />
                    </div>
                  </section>

                  {/* INFO CARD */}
                  <section className="overflow-hidden rounded-xl bg-[#0F172A] shadow-sm">
                    <div className="relative p-5 sm:p-6">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10" />

                      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blue-400/10" />

                      <div className="relative">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                          <TrendingUp size={19} />
                        </div>

                        <h2 className="text-base font-bold text-white">
                          Kelola Sarpras dengan Mudah
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Pastikan seluruh fasilitas sekolah
                          tercatat, terawat, dan dapat
                          digunakan secara optimal.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/admin/sarpras/gedung"
                            )
                          }
                          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                        >
                          Kelola Gedung

                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* GEDUNG TERDAFTAR */}
              <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A]">
                        Gedung Terdaftar
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Data gedung yang sudah tercatat pada
                        sistem
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/sarpras/gedung"
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                    >
                      Lihat Semua

                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-200" />

                          <div className="flex-1">
                            <div className="h-4 w-3/4 rounded bg-slate-200" />

                            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                          </div>
                        </div>

                        <div className="mt-4 h-3 w-full rounded bg-slate-100" />

                        <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : filteredGedung.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Building2 size={25} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                      {search
                        ? "Gedung tidak ditemukan"
                        : "Belum ada data gedung"}
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      {search
                        ? "Coba gunakan kata kunci pencarian yang berbeda."
                        : "Tambahkan gedung pertama untuk mulai mengelola sarana dan prasarana."}
                    </p>

                    {!search && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/gedung/tambah"
                          )
                        }
                        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                      >
                        <Plus size={16} />

                        Tambah Gedung
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                    {filteredGedung
                      .slice(0, 6)
                      .map((item, index) => {
                        const id =
                          item?.id ||
                          item?.gedungId ||
                          item?.gedung_id;

                        const nama =
                          item?.nama ||
                          item?.namaGedung ||
                          item?.nama_gedung ||
                          `Gedung ${index + 1}`;

                        const kode =
                          item?.kode ||
                          item?.kodeGedung ||
                          item?.kode_gedung ||
                          "-";

                        const lokasi =
                          item?.lokasi ||
                          item?.alamat ||
                          "Lokasi belum diatur";

                        const status = String(
                          item?.status ||
                            item?.statusGedung ||
                            "aktif"
                        ).toLowerCase();

                        const createdAt =
                          item?.dibuatPada ||
                          item?.createdAt ||
                          item?.created_at;

                        return (
                          <button
                            key={id || index}
                            type="button"
                            onClick={() => {
                              if (id) {
                                router.push(
                                  `/admin/sarpras/gedung/${id}`
                                );
                              } else {
                                router.push(
                                  "/admin/sarpras/gedung"
                                );
                              }
                            }}
                            className="group min-w-0 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                  <Building2 size={19} />
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-bold text-slate-800">
                                    {nama}
                                  </h3>

                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    Kode: {kode}
                                  </p>
                                </div>
                              </div>

                              <ChevronRight
                                size={17}
                                className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
                              />
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                              <MapPin
                                size={14}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {lokasi}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  status === "aktif"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    status === "aktif"
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />

                                {status === "aktif"
                                  ? "Aktif"
                                  : "Tidak Aktif"}
                              </span>

                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock3 size={12} />

                                {formatDate(createdAt)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </section>

              {/* FOOTER */}
              <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} />

                  <span>
                    SmartSchool • Manajemen Sarana & Prasarana
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-500"
                  />

                  <span>Sistem terintegrasi</span>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          <Icon size={20} />
        </div>

        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
          {trend}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <Icon size={17} />
        </div>

        <span className="truncate text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}