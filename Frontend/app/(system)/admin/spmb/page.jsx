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
    title: "Data Pendaftaran",
    description:
      "Formulir pendaftaran calon siswa.",
    href: "/admin/spmb/data-pendaftaran",
    icon: Users,
    status: "blocked",
    statusText:
      "Form tambah tersedia; endpoint baca daftar/detail belum ada",
  },
  {
    title: "Pendaftar",
    description:
      "Daftar dan verifikasi pendaftar.",
    href: "/admin/spmb/pendaftar",
    icon: ClipboardCheck,
    status: "blocked",
    statusText:
      "Dialihkan ke Data Pendaftaran; endpoint baca belum tersedia",
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
      "Rekap kuota per jalur pendaftaran.",
    href: "/admin/spmb/kuota",
    icon: Layers3,
    status: "partial",
    statusText: "Kuota nyata; jumlah terisi belum tersedia",
  },
  {
    title: "Seleksi",
    description:
      "Perangkingan dan hasil seleksi.",
    href: "/admin/spmb/seleksi",
    icon: GraduationCap,
    status: "blocked",
    statusText: "Belum ada endpoint hasil seleksi",
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
    statusText: "Belum ada model/endpoint pengumuman",
  },
  {
    title: "Laporan",
    description:
      "Rekap dan ekspor data SPMB.",
    href: "/admin/spmb/laporan",
    icon: FileText,
    status: "blocked",
    statusText: "Butuh endpoint daftar/agregat",
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

  const modulesDenganStatus = modules.map((item) =>
    item.title === "Gelombang"
      ? { ...item, ...gelombangStatus }
      : item
  );

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

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                Endpoint PPDB yang benar-benar terpasang di
                Backend lokal: POST /api/ppdb/daftar, POST
                /api/ppdb/:id/berkas, PATCH
                /api/ppdb/:id/verifikasi, CRUD
                /api/jalur-ppdb, dan GET/POST
                /api/pengaturan. Endpoint baca GET
                /api/ppdb/pendaftar dan GET
                /api/ppdb/pendaftar/:id belum tersedia,
                sehingga daftar dan detail pendaftar belum
                dapat ditampilkan; hanya formulir
                pendaftaran yang dapat dipakai. Status
                /api/gelombang-ppdb diperiksa langsung saat
                halaman ini dibuka:{" "}
                {gelombangStatus.status === "ready"
                  ? "route tersedia dan modul siap dipakai"
                  : "route belum tersedia sehingga modul ditandai terblokir"}
                . Pengaturan SPMB dapat disimpan, tetapi belum
                dibaca oleh alur pendaftaran Backend.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
