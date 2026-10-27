"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Route,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { useSpmbRekap } from "@/lib/useSpmbRekap";
import {
  formatAngka,
  formatNilai,
  formatTanggal,
  formatTanggalJam,
  hitungRekapJalur,
  hitungRekapSeleksi,
  normalisasiStatusPendaftaran,
} from "@/lib/spmb";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

export default function DashboardSpmbPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const {
    pendaftar,
    jalur,
    statistik,
    jumlahHalaman,
    terpotong,
    loading,
    refreshing,
    error,
    endpointUnavailable,
    dimuatPada,
    muatUlang,
  } = useSpmbRekap();

  const rekapJalur = useMemo(
    () => hitungRekapJalur(pendaftar, jalur),
    [pendaftar, jalur]
  );

  const rekapSeleksi = useMemo(
    () => hitungRekapSeleksi(pendaftar),
    [pendaftar]
  );

  const totalKuota = useMemo(
    () =>
      rekapJalur.reduce(
        (total, item) => total + item.kuota,
        0
      ),
    [rekapJalur]
  );

  const totalTerisi = useMemo(
    () =>
      rekapJalur.reduce(
        (total, item) => total + item.nonDitolak,
        0
      ),
    [rekapJalur]
  );

  const pendaftarTerbaru = useMemo(() => {
    return [...pendaftar]
      .sort((a, b) => {
        const waktuA = new Date(
          a?.dibuatPada || 0
        ).getTime();
        const waktuB = new Date(
          b?.dibuatPada || 0
        ).getTime();

        return waktuB - waktuA;
      })
      .slice(0, 5);
  }, [pendaftar]);

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
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <LayoutDashboard size={21} />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Dashboard SPMB
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Ringkasan pendaftaran, kuota jalur, dan
                    hasil seleksi dari data pendaftar resmi.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/spmb/data-pendaftaran"
                    )
                  }
                  className={`theme-neutral-border theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]`}
                >
                  Data Pendaftaran
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => muatUlang(true)}
                  disabled={refreshing}
                  className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {refreshing ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={28}
                    className={`${themePrimaryText} mx-auto animate-spin`}
                  />

                  <p className="theme-text-muted mt-3 text-xs font-medium">
                    Memuat rekap pendaftar...
                  </p>
                </div>
              </div>
            ) : endpointUnavailable ? (
              <BelumTersedia
                onRetry={() => muatUlang(true)}
              />
            ) : error ? (
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="theme-danger mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="theme-text text-sm font-bold">
                      Gagal memuat rekap SPMB
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs leading-5">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => muatUlang(true)}
                      className={`${themePrimaryGradient} mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                    >
                      <RefreshCw size={14} />
                      Muat Ulang
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat
                    title="Total Pendaftar"
                    value={statistik?.total}
                    icon={Users}
                  />

                  <Stat
                    title="Terverifikasi"
                    value={statistik?.lulus}
                    icon={CheckCircle2}
                    tone="success"
                  />

                  <Stat
                    title="Menunggu"
                    value={statistik?.menunggu}
                    icon={Clock3}
                    tone="warning"
                  />

                  <Stat
                    title="Ditolak"
                    value={statistik?.ditolak}
                    icon={XCircle}
                    tone="danger"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
                  <div
                    className={`theme-card ${themeNeutralBorder} rounded-2xl border p-5 ${themeCardShadow} lg:col-span-3`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Kuota per Jalur
                        </h2>

                        <p className="theme-text-muted mt-1 text-xs">
                          Terisi = pendaftar yang tidak
                          ditolak.
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="theme-text text-lg font-bold">
                          {formatAngka(totalKuota)}
                        </p>

                        <p className="theme-text-muted text-[10px] uppercase tracking-wide">
                          Total kuota
                        </p>
                      </div>
                    </div>

                    {rekapJalur.length === 0 ? (
                      <p className="theme-text-muted mt-5 text-xs">
                        Belum ada jalur pendaftaran.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {rekapJalur.map((item) => {
                          const persen =
                            item.kuota > 0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (item.nonDitolak /
                                      item.kuota) *
                                      100
                                  )
                                )
                              : 0;

                          return (
                            <div key={item.id}>
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="theme-text inline-flex min-w-0 items-center gap-1.5 font-semibold">
                                  <Route
                                    size={12}
                                    className={`${themePrimaryText} shrink-0`}
                                  />
                                  <span className="truncate">
                                    {item.nama}
                                  </span>
                                </span>

                                <span className="theme-text-secondary shrink-0">
                                  {formatAngka(
                                    item.nonDitolak
                                  )}
                                  {" / "}
                                  {formatAngka(item.kuota)}
                                </span>
                              </div>

                              <div
                                className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
                              >
                                <div
                                  className="h-full rounded-full bg-[var(--color-primary)]"
                                  style={{
                                    width: `${persen}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div
                      className={`mt-4 flex items-center justify-between border-t ${themeDivider} pt-3 text-xs`}
                    >
                      <span className="theme-text-muted">
                        Terisi{" "}
                        {formatAngka(totalTerisi)} dari{" "}
                        {formatAngka(totalKuota)} kuota
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/spmb/kuota"
                          )
                        }
                        className={`${themePrimaryText} inline-flex items-center gap-1 font-semibold`}
                      >
                        Detail
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`theme-card ${themeNeutralBorder} rounded-2xl border p-5 ${themeCardShadow} lg:col-span-2`}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy
                        size={16}
                        className={themePrimaryText}
                      />

                      <h2 className="theme-text text-sm font-bold">
                        Ringkasan Seleksi
                      </h2>
                    </div>

                    {rekapSeleksi.tersedia ? (
                      <dl className="mt-4 space-y-3">
                        <BarisRingkasan
                          label="Sudah ada hasil"
                          value={formatAngka(
                            rekapSeleksi.sudahAdaHasil
                          )}
                        />

                        <BarisRingkasan
                          label="Belum ada hasil"
                          value={formatAngka(
                            rekapSeleksi.belumAdaHasil
                          )}
                        />

                        <BarisRingkasan
                          label="Sudah dinilai"
                          value={formatAngka(
                            rekapSeleksi.jumlahDinilai
                          )}
                        />

                        <BarisRingkasan
                          label="Rata-rata nilai tes"
                          value={formatNilai(
                            rekapSeleksi.rataNilaiTes
                          )}
                        />
                      </dl>
                    ) : (
                      <p className="theme-text-muted mt-4 text-xs leading-5">
                        Respons daftar dari Backend ini
                        tidak menyertakan{" "}
                        <code>hasilSeleksiPpdb</code>.
                        Nilai dan peringkat dapat dimuat
                        dari endpoint detail melalui
                        halaman Seleksi.
                      </p>
                    )}

                    {rekapSeleksi.statusKelulusan.length >
                      0 && (
                      <div
                        className={`mt-4 border-t ${themeDivider} pt-3`}
                      >
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                          Status kelulusan
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {rekapSeleksi.statusKelulusan.map(
                            (item) => (
                              <span
                                key={item.label}
                                className={`${themeNeutralSurface} ${themeNeutralBorder} rounded-md border px-2 py-1 text-[10px] font-semibold capitalize theme-text-secondary`}
                              >
                                {item.label}:{" "}
                                {formatAngka(item.jumlah)}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/spmb/seleksi"
                        )
                      }
                      className={`${themePrimaryText} mt-4 inline-flex items-center gap-1 text-xs font-semibold`}
                    >
                      Buka Seleksi
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                <div
                  className={`theme-card ${themeNeutralBorder} mt-4 overflow-hidden rounded-2xl border ${themeCardShadow}`}
                >
                  <div
                    className={`flex items-center justify-between gap-3 border-b ${themeDivider} px-5 py-4`}
                  >
                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Pendaftar Terbaru
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-xs">
                        Lima pendaftaran terakhir yang
                        tercatat.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/spmb/data-pendaftaran"
                        )
                      }
                      className={`${themePrimaryText} inline-flex items-center gap-1 text-xs font-semibold`}
                    >
                      Lihat semua
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {pendaftarTerbaru.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <Users
                        size={24}
                        className="theme-text-muted mx-auto"
                      />

                      <p className="theme-text-muted mt-2 text-xs">
                        Belum ada pendaftar pada sekolah
                        ini.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px]">
                        <thead>
                          <tr
                            className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                          >
                            <Th>Pendaftar</Th>
                            <Th>Jalur</Th>
                            <Th>Tanggal</Th>
                            <Th>Status</Th>
                          </tr>
                        </thead>

                        <tbody>
                          {pendaftarTerbaru.map((item) => (
                            <tr
                              key={item.id}
                              className={`border-b ${themeDivider} last:border-0`}
                            >
                              <td className="px-5 py-3">
                                <p className="theme-text text-xs font-semibold">
                                  {item.namaLengkap ||
                                    "-"}
                                </p>

                                <p className="theme-text-muted text-[10px]">
                                  {item.nomorPendaftaran ||
                                    "-"}
                                </p>
                              </td>

                              <td className="theme-text-secondary px-5 py-3 text-xs">
                                {item.jalurPpdb?.nama || "-"}
                              </td>

                              <td className="theme-text-secondary px-5 py-3 text-xs">
                                {formatTanggal(
                                  item.dibuatPada
                                )}
                              </td>

                              <td className="px-5 py-3">
                                <StatusBadge
                                  status={item.status}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <p className="theme-text-muted mt-4 text-[11px] leading-5">
                  Sumber: GET /api/ppdb/pendaftar (
                  {formatAngka(jumlahHalaman)} halaman
                  dimuat). Statistik memakai{" "}
                  <code>response.statistik</code> bila
                  tersedia, selain itu dihitung dari data
                  yang diterima.
                  {dimuatPada
                    ? ` Dimuat ${formatTanggalJam(
                        dimuatPada
                      )}.`
                    : ""}
                  {terpotong
                    ? " Sebagian data tidak dimuat karena melebihi batas halaman."
                    : ""}
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function BelumTersedia({ onRetry }) {
  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <AlertCircle
          size={20}
          className="mt-0.5 shrink-0 text-[var(--color-warning)]"
        />

        <div>
          <p className="theme-text text-sm font-bold">
            Endpoint daftar pendaftar belum aktif
          </p>

          <p className="theme-text-secondary mt-1 text-sm leading-6">
            Server Backend yang sedang berjalan
            mengembalikan 404 untuk{" "}
            <code>GET /api/ppdb/pendaftar</code>,
            sehingga rekap belum dapat dihitung. Halaman
            ini tidak menampilkan angka contoh.
          </p>

          <p className="theme-text-muted mt-2 text-xs leading-5">
            Artefak build <code>Backend/dist</code> sudah
            memuat handler daftar pendaftar. Rekap akan
            tampil otomatis setelah server yang berjalan
            memakai build tersebut atau sumbernya
            disinkronkan.
          </p>

          <button
            type="button"
            onClick={onRetry}
            className={`${themePrimaryGradient} mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
          >
            <RefreshCw size={14} />
            Coba Muat Ulang
          </button>
        </div>
      </div>
    </div>
  );
}

function BarisRingkasan({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="theme-text-secondary">{label}</dt>

      <dd className="theme-text font-semibold">
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }) {
  const info = normalisasiStatusPendaftaran(status);

  const className =
    info.key === "lulus"
      ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
      : info.key === "ditolak"
        ? "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-danger"
        : "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]";

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold ${className}`}
    >
      {info.label}
    </span>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
  tone = "primary",
}) {
  const toneConfig = {
    primary: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
      text: "text-[var(--color-primary)]",
    },
    success: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      text: "text-[var(--color-success)]",
    },
    warning: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
      text: "text-[var(--color-warning)]",
    },
    danger: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]",
      text: "text-[var(--color-danger)]",
    },
  };

  const current = toneConfig[tone] || toneConfig.primary;

  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-4 ${themeCardShadow}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="theme-text-muted text-xs">{title}</p>

          <p className="theme-text mt-1 text-2xl font-bold">
            {formatAngka(value)}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${current.surface}`}
        >
          <Icon size={18} className={current.text} />
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="theme-text-muted px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}
