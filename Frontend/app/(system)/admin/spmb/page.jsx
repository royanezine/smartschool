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
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getGelombangPpdb,
  isGelombangEndpointMissing,
} from "@/services/gelombangPpdb.service";
import {
  getPendaftarPpdb,
  isPpdbEndpointMissing,
} from "@/services/ppdb.service";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const modules = [
  {
    title: "Dashboard",
    description:
      "Ringkasan pendaftaran, kuota, dan seleksi.",
    href: "/admin/spmb/dashboard",
    icon: LayoutDashboard,
    status: "partial",
    statusText:
      "Memeriksa endpoint daftar pendaftar...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap:
      "Rekap dari GET /api/ppdb/pendaftar",
  },
  {
    title: "Data Pendaftaran",
    description:
      "Daftar, detail, dan verifikasi pendaftar.",
    href: "/admin/spmb/data-pendaftaran",
    icon: Users,
    status: "partial",
    statusText:
      "Memeriksa endpoint daftar pendaftar...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap:
      "Daftar, detail, verifikasi, dan statistik resmi",
  },
  {
    title: "Pendaftar",
    description:
      "Daftar dan verifikasi pendaftar.",
    href: "/admin/spmb/pendaftar",
    icon: ClipboardCheck,
    status: "partial",
    statusText:
      "Dialihkan ke Data Pendaftaran",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap:
      "Dialihkan ke Data Pendaftaran",
  },
  {
    title: "Jalur Pendaftaran",
    description:
      "CRUD jalur, kuota, dan periode.",
    href: "/admin/spmb/jalur",
    icon: Route,
    status: "ready",
    statusText:
      "CRUD /api/jalur-ppdb terpasang; butuh sesi admin",
  },
  {
    title: "Kuota",
    description:
      "Rekap kuota, terisi, dan sisa per jalur.",
    href: "/admin/spmb/kuota",
    icon: Layers3,
    status: "partial",
    statusText:
      "Memeriksa endpoint daftar pendaftar...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap:
      "Kuota, terisi, dan sisa dari data resmi",
  },
  {
    title: "Seleksi",
    description:
      "Perangkingan dan hasil seleksi.",
    href: "/admin/spmb/seleksi",
    icon: GraduationCap,
    status: "partial",
    statusText:
      "Memeriksa endpoint daftar pendaftar...",
    cekPendaftar: true,
    statusSiap: "partial",
    statusTextSiap:
      "Baca nilai/peringkat; penetapan hasil belum ada",
  },
  {
    title: "Gelombang",
    description:
      "Periode gelombang pendaftaran.",
    href: "/admin/spmb/gelombang",
    icon: CalendarDays,
    status: "blocked",
    statusText:
      "Endpoint /api/gelombang-ppdb belum tersedia (404)",
  },
  {
    title: "Pengumuman",
    description:
      "Pengumuman resmi PPDB.",
    href: "/admin/spmb/pengumuman",
    icon: Megaphone,
    status: "blocked",
    statusText:
      "Belum ada model/route pengumuman PPDB",
  },
  {
    title: "Laporan",
    description:
      "Rekap dan ekspor data SPMB.",
    href: "/admin/spmb/laporan",
    icon: FileText,
    status: "partial",
    statusText:
      "Memeriksa endpoint daftar pendaftar...",
    cekPendaftar: true,
    statusSiap: "ready",
    statusTextSiap:
      "Rekap dan ekspor CSV dari data resmi",
  },
  {
    title: "Pengaturan",
    description:
      "Konfigurasi pendaftaran dan verifikasi.",
    href: "/admin/spmb/pengaturan",
    icon: Settings2,
    status: "partial",
    statusText:
      "GET/POST /api/pengaturan tersedia; belum dibaca alur PPDB",
  },
];

const statusStyles = {
  ready: {
    label: "Terhubung",
    icon: CheckCircle2,
    className:
      "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]",
  },
  partial: {
    label: "Sebagian",
    icon: AlertCircle,
    className:
      "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]",
  },
  blocked: {
    label: "Terblokir",
    icon: AlertCircle,
    className:
      "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-danger",
  },
};

export default function SpmbOverviewPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [gelombangStatus, setGelombangStatus] =
    useState({
      status: "partial",
      statusText:
        "Memeriksa endpoint /api/gelombang-ppdb...",
    });

  const [pendaftarTersedia, setPendaftarTersedia] =
    useState(null);

  const [pendaftarPesan, setPendaftarPesan] =
    useState("");

  useEffect(() => {
    let aktif = true;

    (async () => {
      try {
        const response = await getGelombangPpdb();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Endpoint gelombang PPDB tidak merespons dengan benar."
          );
        }

        const jumlah = Array.isArray(response?.data)
          ? response.data.length
          : 0;

        if (!aktif) {
          return;
        }

        setGelombangStatus({
          status: "ready",
          statusText: `CRUD /api/gelombang-ppdb terpasang${
            jumlah ? ` (${jumlah} gelombang)` : ""
          }`,
        });
      } catch (err) {
        if (!aktif) {
          return;
        }

        if (isGelombangEndpointMissing(err)) {
          setGelombangStatus({
            status: "blocked",
            statusText:
              "Endpoint /api/gelombang-ppdb belum tersedia (404)",
          });
        } else {
          setGelombangStatus({
            status: "partial",
            statusText:
              err instanceof Error
                ? err.message
                : "Gagal memeriksa endpoint gelombang",
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

        if (!aktif) {
          return;
        }

        setPendaftarTersedia(Boolean(response?.success));
        setPendaftarPesan("");
      } catch (err) {
        if (!aktif) {
          return;
        }

        setPendaftarTersedia(false);
        setPendaftarPesan(
          isPpdbEndpointMissing(err)
            ? "GET /api/ppdb/pendaftar belum aktif pada server berjalan (404)"
            : err instanceof Error
              ? err.message
              : "Gagal memeriksa endpoint daftar pendaftar"
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

    if (!item.cekPendaftar) {
      return item;
    }

    if (pendaftarTersedia === null) {
      return {
        ...item,
        status: "partial",
        statusText:
          "Memeriksa endpoint daftar pendaftar...",
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
      statusText:
        pendaftarPesan ||
        "GET /api/ppdb/pendaftar belum aktif (404)",
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
            toggleSidebar={() =>
              setCollapsed((value) => !value)
            }
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
                  Status integrasi setiap modul dengan
                  Backend SmartSchool. Modul tanpa
                  endpoint tidak menampilkan data
                  contoh.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {modulesDenganStatus.map((item) => {
                const Icon = item.icon;

                const status =
                  statusStyles[item.status];

                const StatusIcon = status.icon;

                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() =>
                      router.push(item.href)
                    }
                    className={`theme-card ${themeNeutralBorder} group rounded-2xl border p-5 text-left ${themeCardShadow} transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Icon size={19} />
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

            <div
              className={`${themePrimaryGradient} mt-6 rounded-2xl p-5 text-[var(--color-card)] sm:p-6`}
            >
              <p className="text-sm font-bold">
                Ringkasan integrasi
              </p>

              <p className="mt-1.5 text-xs leading-5 opacity-90">
                Endpoint PPDB yang terpasang: POST
                /api/ppdb/daftar, POST /api/ppdb/:id/berkas,
                PATCH /api/ppdb/:id/verifikasi, CRUD
                /api/jalur-ppdb, dan GET/POST
                /api/pengaturan. Dashboard, Data
                Pendaftaran, Seleksi, Kuota, dan Laporan
                membaca GET /api/ppdb/pendaftar beserta
                GET /api/ppdb/pendaftar/:id; status
                endpoint daftar diperiksa langsung saat
                halaman ini dibuka:{" "}
                {pendaftarTersedia === null
                  ? "sedang diperiksa"
                  : pendaftarTersedia
                    ? "route merespons, modul rekap aktif"
                    : "route belum aktif pada server berjalan, modul rekap menampilkan status belum tersedia tanpa angka contoh"}
                . Status /api/gelombang-ppdb juga diperiksa
                langsung:{" "}
                {gelombangStatus.status === "ready"
                  ? "route tersedia dan modul siap dipakai"
                  : "route belum tersedia sehingga modul ditandai terblokir"}
                . Pengaturan SPMB dapat disimpan, tetapi
                belum dibaca oleh alur pendaftaran Backend.
                Pengumuman PPDB belum memiliki model
                maupun route.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
