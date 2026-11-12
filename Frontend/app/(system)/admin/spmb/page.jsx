"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers3,
  LayoutDashboard,
  Megaphone,
  Route,
  Settings2,
  Users,
  CalendarDays,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Lock,
  RefreshCw,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getGelombangPpdb,
  isGelombangEndpointMissing,
} from "@/services/gelombangPpdb.service";
import {
  getPendaftarPpdb,
  getPengumumanPpdb,
  isPpdbEndpointMissing,
  isPengumumanEndpointMissing,
} from "@/services/ppdb.service";

const themePrimaryText = "theme-primary-text";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const modules = [
  {
    title: "Ringkasan Pendaftaran",
    description: "Lihat ringkasan pendaftaran, kuota, dan seleksi.",
    href: "/admin/spmb/dashboard",
    icon: LayoutDashboard,
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap: "Data siap ditampilkan",
  },
  {
    title: "Data Pendaftaran",
    description: "Lihat daftar, detail, dan verifikasi pendaftar.",
    href: "/admin/spmb/data-pendaftaran",
    icon: Users,
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap: "Fitur siap digunakan",
  },
  {
    title: "Pendaftar",
    description: "Lihat dan verifikasi data pendaftar.",
    href: "/admin/spmb/pendaftar",
    icon: ClipboardCheck,
    status: "partial",
    statusText: "Mengalihkan ke Data Pendaftaran...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap: "Mengalihkan ke Data Pendaftaran",
  },
  {
    title: "Jalur Pendaftaran",
    description: "Kelola jalur, kuota, dan periode pendaftaran.",
    href: "/admin/spmb/jalur",
    icon: Route,
    status: "ready",
    statusText: "Fitur siap digunakan",
  },
  {
    title: "Kuota",
    description: "Lihat rekap kuota, terisi, dan sisa per jalur.",
    href: "/admin/spmb/kuota",
    icon: Layers3,
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap: "Data kuota siap ditampilkan",
  },
  {
    title: "Seleksi",
    description: "Lihat perangkingan dan hasil seleksi.",
    href: "/admin/spmb/seleksi",
    icon: GraduationCap,
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
    cekPendaftar: true,
    statusSiap: "partial",
    statusTextSiap: "Fitur sebagian siap (penetapan hasil belum tersedia)",
  },
  {
    title: "Gelombang",
    description: "Atur periode gelombang pendaftaran.",
    href: "/admin/spmb/gelombang",
    icon: CalendarDays,
    status: "blocked",
    statusText: "Fitur belum tersedia saat ini",
  },
  {
    title: "Pengumuman",
    description: "Lihat dan kelola pengumuman resmi.",
    href: "/admin/spmb/pengumuman",
    icon: Megaphone,
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
  },
  {
    title: "Laporan",
    description: "Lihat rekap dan ekspor data pendaftaran.",
    href: "/admin/spmb/laporan",
    icon: FileText,
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap: "Fitur ekspor siap digunakan",
  },
  {
    title: "Pengaturan",
    description: "Atur konfigurasi pendaftaran dan verifikasi.",
    href: "/admin/spmb/pengaturan",
    icon: Settings2,
    status: "partial",
    statusText: "Fitur siap digunakan (belum terhubung ke alur utama)",
  },
];

const statusStyles = {
  ready: {
    label: "Siap Digunakan",
    icon: CheckCircle2,
    className:
      "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]",
  },
  partial: {
    label: "Sebagian Siap",
    icon: AlertCircle,
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]",
  },
  blocked: {
    label: "Belum Tersedia",
    icon: Lock,
    className:
      "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-danger",
  },
};

export default function SpmbOverviewPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [gelombangStatus, setGelombangStatus] = useState({
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
  });

  const [pendaftarTersedia, setPendaftarTersedia] = useState(null);
  const [pendaftarPesan, setPendaftarPesan] = useState("");
  const [pengumumanStatus, setPengumumanStatus] = useState({
    status: "partial",
    statusText: "Sedang memeriksa ketersediaan data...",
  });

  useEffect(() => {
    let aktif = true;

    (async () => {
      try {
        const response = await getPengumumanPpdb({
          page: 1,
          limit: 1,
        });

        if (!response?.success) {
          throw new Error(
            response?.message || "Sistem pengumuman tidak merespons dengan benar."
          );
        }

        const jumlah = Number.isFinite(response?.meta?.totalData)
          ? response.meta.totalData
          : Array.isArray(response?.data)
            ? response.data.length
            : 0;

        if (!aktif) return;

        setPengumumanStatus({
          status: "ready",
          statusText: jumlah
            ? `Fitur pengumuman aktif (${jumlah} data ditemukan)`
            : "Fitur pengumuman aktif (belum ada data)",
        });
      } catch (err) {
        if (!aktif) return;

        if (isPengumumanEndpointMissing(err)) {
          setPengumumanStatus({
            status: "blocked",
            statusText: "Fitur pengumuman belum tersedia saat ini",
          });
        } else if (err?.status === 401) {
          setPengumumanStatus({
            status: "partial",
            statusText: "Silakan login sebagai admin untuk mengakses fitur ini",
          });
        } else {
          setPengumumanStatus({
            status: "partial",
            statusText:
              err instanceof Error
                ? err.message
                : "Gagal memeriksa ketersediaan fitur",
          });
        }
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    let aktif = true;

    (async () => {
      try {
        const response = await getGelombangPpdb();

        if (!response?.success) {
          throw new Error(
            response?.message || "Sistem gelombang tidak merespons dengan benar."
          );
        }

        const jumlah = Array.isArray(response?.data)
          ? response.data.length
          : 0;

        if (!aktif) return;

        setGelombangStatus({
          status: "ready",
          statusText: `Fitur gelombang aktif ${
            jumlah ? `(${jumlah} gelombang ditemukan)` : ""
          }`,
        });
      } catch (err) {
        if (!aktif) return;

        if (isGelombangEndpointMissing(err)) {
          setGelombangStatus({
            status: "blocked",
            statusText: "Fitur gelombang belum tersedia saat ini",
          });
        } else {
          setGelombangStatus({
            status: "partial",
            statusText:
              err instanceof Error
                ? err.message
                : "Gagal memeriksa ketersediaan fitur",
          });
        }
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    let aktif = true;

    (async () => {
      try {
        const response = await getPendaftarPpdb({
          page: 1,
          limit: 1,
        });

        if (!aktif) return;

        setPendaftarTersedia(Boolean(response?.success));
        setPendaftarPesan("");
      } catch (err) {
        if (!aktif) return;

        setPendaftarTersedia(false);
        setPendaftarPesan(
          isPpdbEndpointMissing(err)
            ? "Fitur pendaftar belum aktif pada sistem"
            : err instanceof Error
              ? err.message
              : "Gagal memeriksa ketersediaan data"
        );
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  const modulesDenganStatus = modules.map((item) => {
    if (item.title === "Gelombang") {
      return { ...item, ...gelombangStatus };
    }

    if (item.title === "Pengumuman") {
      return { ...item, ...pengumumanStatus };
    }

    if (!item.cekPendaftar) {
      return item;
    }

    if (pendaftarTersedia === null) {
      return {
        ...item,
        status: "partial",
        statusText: "Sedang memeriksa ketersediaan data...",
      };
    }

    if (pendaftarTersedia) {
      return {
        ...item,
        status: item.statusSiap,
        statusText: item.statusTextSiap,
      };
    }

    return {
      ...item,
      status: "blocked",
      statusText: pendaftarPesan || "Fitur pendaftar belum aktif pada sistem",
    };
  });

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((value) => !value)}
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
            <div className="mb-6 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <LayoutDashboard size={21} />
              </div>

              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  SPMB / PPDB
                </h1>

                <p className="theme-text-secondary mt-1 text-sm leading-6">
                  Pusat informasi dan pengelolaan penerimaan murid baru. 
                  Silakan pilih menu di bawah ini untuk mulai bekerja.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {modulesDenganStatus.map((item) => {
                const Icon = item.icon;
                const status = statusStyles[item.status];
                const StatusIcon = status.icon;

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`theme-card ${themeNeutralBorder} group rounded-2xl border p-5 text-left ${themeCardShadow} transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Icon size={19} className="theme-primary-text shrink-0" />
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                      >
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </div>

                    <h2 className="theme-text mt-4 text-sm font-bold">
                      {item.title}
                    </h2>

                    <p className="theme-text-secondary mt-1 text-xs leading-5">
                      {item.description}
                    </p>

                    <div
                      className={`mt-4 flex items-center justify-between gap-2 border-t ${themeDivider} pt-3`}
                    >
                      <p className="theme-text-muted text-[11px] leading-4">
                        {item.statusText}
                      </p>

                      <ChevronRight
                        size={15}
                        className="theme-text-muted shrink-0 transition group-hover:text-[var(--color-primary)]"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}