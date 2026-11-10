"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DoorOpen,
  Package,
  Wrench,
  ClipboardList,
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
  MapPin,
  FileText,
  History,
  FolderPlus,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getGedung } from "@/services/infrastruktur.service";
import { getAset, getDaftarPeminjaman } from "@/services/sarpras.service";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryHover = "hover:text-[var(--color-primary)]";

const themePrimaryGradient =
  "bg-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-sm";

const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeSmallShadow =
  "shadow-[0_1px_4px_color-mix(in_srgb,var(--color-text)_3%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function SarprasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gedung, setGedung] = useState([]);
  const [totalAsetCount, setTotalAsetCount] = useState(0);
  const [totalPeminjamanCount, setTotalPeminjamanCount] = useState(0);
  const [totalPengembalianCount, setTotalPengembalianCount] = useState(0);
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

      const [resGedung, resAset, resPeminjaman] = await Promise.allSettled([
        getGedung(),
        getAset(),
        getDaftarPeminjaman({ limit: 100 }),
      ]);

      if (resGedung.status === "fulfilled") {
        const response = resGedung.value;
        if (response?.success === false) {
          setError(response?.message || "Data gedung belum dapat dimuat.");
          setGedung([]);
        } else {
          let data = [];
          if (Array.isArray(response)) {
            data = response;
          } else if (Array.isArray(response?.data)) {
            data = response.data;
          } else if (Array.isArray(response?.result)) {
            data = response.result;
          }
          setGedung(data);
        }
      }

      if (resAset.status === "fulfilled") {
        const aVal = resAset.value;
        const aList = Array.isArray(aVal)
          ? aVal
          : Array.isArray(aVal?.data)
          ? aVal.data
          : [];
        setTotalAsetCount(aList.length);
      }

      if (resPeminjaman.status === "fulfilled") {
        const pVal = resPeminjaman.value;
        const pList = Array.isArray(pVal)
          ? pVal
          : Array.isArray(pVal?.data)
          ? pVal.data
          : [];
        setTotalPeminjamanCount(pList.length);
        const dipinjamCount = pList.filter(
          (p) => String(p?.status || "").toUpperCase() === "DIPINJAM"
        ).length;
        setTotalPengembalianCount(dipinjamCount);
      }
    } catch (err) {
      console.error("Gagal memuat data sarpras:", err);
      setError(err?.message || "Terjadi kesalahan saat memuat data.");
      setGedung([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredGedung = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return gedung;
    }

    return gedung.filter((item) => {
      const nama = String(
        item?.nama || item?.namaGedung || item?.nama_gedung || ""
      ).toLowerCase();

      const kode = String(
        item?.kode || item?.kodeGedung || item?.kode_gedung || ""
      ).toLowerCase();

      const lokasi = String(item?.lokasi || item?.alamat || "").toLowerCase();

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
      item?.status || item?.statusGedung || "aktif"
    ).toLowerCase();

    return status === "aktif";
  }).length;

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
      href: "/admin/sarpras/iventaris/tambah",
    },
    {
      title: "Kelola Peminjaman",
      description: "Akses sirkulasi peminjaman",
      icon: ClipboardList,
      href: "/admin/sarpras/peminjaman",
    },
    {
      title: "Tambah Kategori",
      description: "Buat kategori aset baru",
      icon: FolderPlus,
      href: "/admin/sarpras/kategori/tambah",
    },
  ];

  const menuItems = [
    {
      title: "Gedung & Ruangan",
      description: "Kelola gedung, lantai, dan ruangan sekolah",
      icon: Building2,
      href: "/admin/sarpras/gedung",
      stat: `${totalGedung} Gedung`,
      iconClass: `${themeInfoSurface} text-[var(--color-info)]`,
    },
    {
      title: "Inventaris",
      description: "Kelola barang dan aset inventaris sekolah",
      icon: Package,
      href: "/admin/sarpras/iventaris",
      stat: `${totalAsetCount} Aset`,
      iconClass: `${themePrimarySurface} ${themePrimaryText}`,
    },
    {
      title: "Fasilitas",
      description: "Kelola fasilitas dan perlengkapan sekolah",
      icon: Boxes,
      href: "/admin/sarpras/fasilitas",
      stat: "Kelola Fasilitas",
      iconClass: `${themeSuccessSurface} text-[var(--color-success)]`,
    },
    {
      title: "Peminjaman",
      description: "Pantau dan kelola peminjaman barang",
      icon: ClipboardList,
      href: "/admin/sarpras/peminjaman",
      stat: `${totalPeminjamanCount} Transaksi`,
      iconClass: `${themeWarningSurface} text-[var(--color-warning)]`,
    },
    {
      title: "Pengembalian",
      description: "Kelola pengembalian dan kondisi aset",
      icon: RefreshCw,
      href: "/admin/sarpras/pengembalian",
      stat: `${totalPengembalianCount} Dipinjam`,
      iconClass: `${themeInfoSurface} text-[var(--color-info)]`,
    },
    {
      title: "Riwayat Peminjaman",
      description: "Pantau catatan dan riwayat sirkulasi aset",
      icon: History,
      href: "/admin/sarpras/riwayat",
      stat: "Riwayat",
      iconClass: `${themeSuccessSurface} text-[var(--color-success)]`,
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
    <div className="theme-page flex h-screen overflow-hidden">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
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

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Sarana & Prasarana
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Kelola gedung, ruangan, inventaris, fasilitas, peminjaman, dan pemeliharaan sarana sekolah.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} bg-white px-3 text-sm font-medium theme-text-secondary transition hover:bg-slate-50 disabled:opacity-60`}
                >
                  <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/gedung/tambah")}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                >
                  <Plus size={16} />
                  Tambah Gedung
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Gedung"
                value={isLoading ? "..." : totalGedung}
                description="Gedung terdaftar"
                icon={Building2}
                iconBg={themeInfoSurface}
                iconColor="text-[var(--color-info)]"
              />
              <StatCard
                title="Gedung Aktif"
                value={isLoading ? "..." : totalAktif}
                description="Kondisi aktif"
                icon={CheckCircle2}
                iconBg={themeSuccessSurface}
                iconColor="text-[var(--color-success)]"
              />
              <StatCard
                title="Peminjaman"
                value={isLoading ? "..." : totalPeminjamanCount}
                description="Total transaksi"
                icon={ClipboardList}
                iconBg={themeWarningSurface}
                iconColor="text-[var(--color-warning)]"
              />
              <StatCard
                title="Sedang Dipinjam"
                value={isLoading ? "..." : totalPengembalianCount}
                description="Belum dikembalikan"
                icon={RefreshCw}
                iconBg={themeNeutralSurface}
                iconColor="text-[var(--color-text-muted)]"
              />
            </div>

            {error && (
              <div className={`mb-6 flex flex-col gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="flex items-start gap-3">
                  <CircleAlert size={20} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
                  <div>
                    <p className="text-sm font-semibold theme-text">Data belum dapat dimuat</p>
                    <p className="mt-1 text-sm theme-text-secondary">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loadData()}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border ${themeWarningBorder} bg-white px-3 text-sm font-medium theme-text-secondary transition hover:bg-slate-50`}
                >
                  <RefreshCw size={15} />
                  Coba Lagi
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              
              <div className="flex flex-col gap-6 xl:col-span-4">
                <section className={`overflow-hidden rounded-xl border ${themeNeutralBorder} bg-white ${themeCardShadow}`}>
                  <div className={`flex items-center justify-between border-b ${themeDivider} p-4`}>
                    <div>
                      <h2 className="text-sm font-bold theme-text">Aksi Cepat</h2>
                      <p className="mt-0.5 text-xs theme-text-secondary">Akses fitur Sarpras</p>
                    </div>
                    <LayoutGrid size={18} className="theme-text-muted" />
                  </div>
                  <div className="flex flex-col p-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.title}
                          type="button"
                          onClick={() => router.push(action.href)}
                          className={`group flex items-center gap-3 rounded-lg p-3 text-left transition ${themeNeutralHover}`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySurface} ${themePrimaryText}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold theme-text">{action.title}</p>
                            <p className="truncate text-xs theme-text-muted">{action.description}</p>
                          </div>
                          <ChevronRight size={16} className="theme-text-muted transition group-hover:translate-x-0.5" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-6 xl:col-span-8">
                <section className={`overflow-hidden rounded-xl border ${themeNeutralBorder} bg-white ${themeCardShadow}`}>
                  <div className={`flex flex-col gap-4 border-b ${themeDivider} p-4 sm:flex-row sm:items-center sm:justify-between`}>
                    <div>
                      <h2 className="text-sm font-bold theme-text">Modul Sarpras</h2>
                      <p className="mt-0.5 text-xs theme-text-secondary">Pilih modul pengelolaan</p>
                    </div>
                    <div className={`flex h-8 w-full items-center rounded-lg border ${themeNeutralBorder} bg-slate-50 px-2.5 sm:w-[220px]`}>
                      <Search size={14} className="shrink-0 theme-text-muted" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari gedung..."
                        className="ml-2 min-w-0 flex-1 bg-transparent text-xs theme-text outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => router.push(item.href)}
                          className={`group flex flex-col rounded-xl border ${themeNeutralBorder} bg-white p-4 text-left transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:shadow-sm`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}>
                              <Icon size={16} />
                            </div>
                            <ArrowRight size={15} className="theme-text-muted transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
                          </div>
                          <div className="mt-3 flex-1">
                            <h3 className="text-sm font-bold theme-text">{item.title}</h3>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed theme-text-secondary">{item.description}</p>
                          </div>
                          <div className={`mt-3 inline-flex items-center gap-1 text-[11px] font-semibold ${themePrimaryText}`}>
                            <span>{item.stat}</span>
                            <ChevronRight size={12} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
              
              <section className={`flex flex-col overflow-hidden rounded-xl border ${themeNeutralBorder} bg-white ${themeCardShadow} xl:col-span-8`}>
                <div className={`flex flex-col gap-3 border-b ${themeDivider} p-4 sm:flex-row sm:items-center sm:justify-between`}>
                  <div>
                    <h2 className="text-sm font-bold theme-text">Gedung Terdaftar</h2>
                    <p className="mt-0.5 text-xs theme-text-secondary">Data gedung yang sudah tercatat</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/sarpras/gedung")}
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${themePrimaryText} hover:opacity-80`}
                  >
                    Lihat Semua <ArrowRight size={14} />
                  </button>
                </div>

                <div className="flex-1 p-2">
                  {isLoading ? (
                    <div className="space-y-2 p-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg border border-transparent p-3">
                          <div className={`h-10 w-10 rounded-lg ${themeNeutralSurface}`} />
                          <div className="flex-1">
                            <div className={`h-4 w-1/3 rounded ${themeNeutralSurface}`} />
                            <div className={`mt-2 h-3 w-1/4 rounded ${themeNeutralSurface}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredGedung.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                      <Building2 size={24} className="theme-text-muted" />
                      <h3 className="mt-3 text-sm font-bold theme-text">
                        {search ? "Gedung tidak ditemukan" : "Belum ada data gedung"}
                      </h3>
                      <p className="mt-1 max-w-xs text-xs theme-text-secondary">
                        {search ? "Coba kata kunci lain." : "Tambahkan gedung pertama Anda."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {filteredGedung.slice(0, 5).map((item, index) => {
                        const id = item?.id || item?.gedungId || item?.gedung_id;
                        const nama = item?.nama || item?.namaGedung || item?.nama_gedung || `Gedung ${index + 1}`;
                        const kode = item?.kode || item?.kodeGedung || item?.kode_gedung || "-";
                        const lokasi = item?.lokasi || item?.alamat || "Lokasi belum diatur";
                        const status = String(item?.status || item?.statusGedung || "aktif").toLowerCase();
                        const createdAt = item?.dibuatPada || item?.createdAt || item?.created_at;

                        return (
                          <button
                            key={id || index}
                            type="button"
                            onClick={() => {
                              if (id) router.push(`/admin/sarpras/gedung/detail/${id}`);
                              else router.push("/admin/sarpras/gedung");
                            }}
                            className={`group flex items-center gap-3 rounded-lg p-3 text-left transition ${themeNeutralHover}`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}>
                              <Building2 size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold theme-text">{nama}</h3>
                                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  status === "aktif" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {status === "aktif" ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] theme-text-secondary">
                                <span>Kode: {kode}</span>
                                <span className="flex items-center gap-1"><MapPin size={10} /> {lokasi}</span>
                              </div>
                            </div>
                            <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                              <span className="flex items-center gap-1 text-[10px] theme-text-muted">
                                <Clock3 size={11} /> {formatDate(createdAt)}
                              </span>
                              <ChevronRight size={16} className="theme-text-muted transition group-hover:translate-x-0.5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <div className="flex flex-col gap-6 xl:col-span-4">
                <section className={`overflow-hidden rounded-xl border ${themeNeutralBorder} bg-white ${themeCardShadow}`}>
                  <div className={`border-b ${themeDivider} p-4`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}>
                        <School size={16} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold theme-text">Ringkasan Sarpras</h2>
                        <p className="text-[10px] theme-text-secondary">Informasi pengelolaan</p>
                      </div>
                    </div>
                  </div>
                  <div className={`divide-y ${themeDivider}`}>
                    <SummaryRow icon={Building2} label="Gedung" value={isLoading ? "..." : totalGedung} />
                    <SummaryRow icon={DoorOpen} label="Ruangan" value="—" />
                    <SummaryRow icon={Package} label="Inventaris" value={isLoading ? "..." : totalAsetCount} />
                    <SummaryRow icon={Wrench} label="Pemeliharaan" value="—" />
                  </div>
                </section>
              </div>
            </div>

            <div className={`mt-6 flex flex-col gap-2 border-t ${themeDivider} py-4 text-[11px] theme-text-muted sm:flex-row sm:items-center sm:justify-between`}>
              <div className="flex items-center gap-2">
                <FileText size={13} />
                <span>SmartSchool • Manajemen Sarana & Prasarana</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                <span>Sistem terintegrasi</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, iconBg, iconColor }) {
  return (
    <div className={`rounded-xl border ${themeNeutralBorder} bg-white p-4 ${themeCardShadow}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary">{title}</p>
        <p className="mt-1 text-xl font-bold tracking-tight theme-text">{value}</p>
        <p className="mt-0.5 text-[11px] theme-text-muted">{description}</p>
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${themeNeutralSurface} theme-text-muted`}>
          <Icon size={14} />
        </div>
        <span className="truncate text-xs font-medium theme-text-secondary">{label}</span>
      </div>
      <span className="text-sm font-bold theme-text">{value}</span>
    </div>
  );
}