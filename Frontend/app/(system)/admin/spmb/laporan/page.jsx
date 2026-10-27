"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { useSpmbRekap } from "@/lib/useSpmbRekap";
import {
  NAMA_BERKAS_WAJIB,
  formatAngka,
  formatNilai,
  formatTanggal,
  formatTanggalJam,
  hitungRekapBerkas,
  hitungRekapJalur,
  hitungRekapSeleksi,
  hitungStatistikPendaftar,
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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function berkasAktif(item) {
  return new Set(
    (Array.isArray(item?.berkasPpdb)
      ? item.berkasPpdb
      : []
    )
      .filter((berkas) => !berkas?.dihapusPada)
      .map((berkas) =>
        String(berkas?.namaBerkas || "").toUpperCase()
      )
  );
}

function buatCsv(rows) {
  const header = [
    "Nomor Pendaftaran",
    "Nama Lengkap",
    "NISN",
    "Jenis Kelamin",
    "Asal Sekolah",
    "Jalur",
    "Tanggal Pendaftaran",
    "Status Pendaftaran",
    "Nilai Tes",
    "Peringkat",
    "Status Kelulusan",
    ...NAMA_BERKAS_WAJIB.map((nama) => `Berkas ${nama}`),
    "Telepon",
    "Email",
  ];

  const body = rows.map((item) => {
    const berkas = berkasAktif(item);
    const status = normalisasiStatusPendaftaran(
      item?.status
    );

    return [
      item?.nomorPendaftaran || "",
      item?.namaLengkap || "",
      item?.nisn || "",
      item?.jenisKelamin || "",
      item?.asalSekolah || "",
      item?.jalurPpdb?.nama || "",
      formatTanggal(item?.dibuatPada),
      status.label,
      formatNilai(item?.hasilSeleksiPpdb?.nilaiTes),
      item?.hasilSeleksiPpdb?.peringkat ?? "",
      item?.hasilSeleksiPpdb?.statusKelulusan ||
        "",
      ...NAMA_BERKAS_WAJIB.map((nama) =>
        berkas.has(nama) ? "Ada" : "Tidak ada"
      ),
      item?.telepon || "",
      item?.email || "",
    ];
  });

  return [header, ...body]
    .map((row) =>
      row
        .map(
          (value) =>
            `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");
}

export default function LaporanSpmbPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [filterJalur, setFilterJalur] =
    useState("Semua");

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

  const daftarJalur = useMemo(
    () =>
      [...jalur].sort((a, b) =>
        String(a?.nama || "").localeCompare(
          String(b?.nama || ""),
          "id"
        )
      ),
    [jalur]
  );

  const dataLaporan = useMemo(() => {
    if (filterJalur === "Semua") {
      return pendaftar;
    }

    return pendaftar.filter(
      (item) =>
        item?.jalurPpdbId === filterJalur ||
        item?.jalurPpdb?.id === filterJalur
    );
  }, [pendaftar, filterJalur]);

  const jalurLaporan = useMemo(
    () =>
      filterJalur === "Semua"
        ? daftarJalur
        : daftarJalur.filter(
            (item) => item.id === filterJalur
          ),
    [daftarJalur, filterJalur]
  );

  const rekapJalur = useMemo(
    () =>
      hitungRekapJalur(
        dataLaporan,
        jalurLaporan
      ),
    [dataLaporan, jalurLaporan]
  );

  const rekapBerkas = useMemo(
    () => hitungRekapBerkas(dataLaporan),
    [dataLaporan]
  );

  const rekapSeleksi = useMemo(
    () => hitungRekapSeleksi(dataLaporan),
    [dataLaporan]
  );

  const totalLengkap = useMemo(() => {
    return dataLaporan.reduce((total, item) => {
      const berkas = berkasAktif(item);

      const lengkap = NAMA_BERKAS_WAJIB.every(
        (nama) => berkas.has(nama)
      );

      return total + (lengkap ? 1 : 0);
    }, 0);
  }, [dataLaporan]);

  const statistikLaporan = useMemo(
    () =>
      hitungStatistikPendaftar(
        dataLaporan,
        filterJalur === "Semua"
          ? statistik
          : undefined
      ),
    [dataLaporan, filterJalur, statistik]
  );

  const exportData = () => {
    if (dataLaporan.length === 0) {
      return;
    }

    const csv = buatCsv(dataLaporan);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      filterJalur === "Semua"
        ? "laporan-spmb.csv"
        : "laporan-spmb-jalur.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

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
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <FileText size={21} />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Laporan SPMB
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Rekap pendaftaran, berkas, dan hasil
                    seleksi dari data resmi.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={exportData}
                  disabled={
                    loading ||
                    endpointUnavailable ||
                    dataLaporan.length === 0
                  }
                  className={`theme-neutral-border theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Download size={14} />
                  Export CSV
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
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={28}
                    className={`${themePrimaryText} mx-auto animate-spin`}
                  />

                  <p className="theme-text-muted mt-3 text-xs font-medium">
                    Menyusun laporan...
                  </p>
                </div>
              </div>
            ) : endpointUnavailable ? (
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                  />

                  <div>
                    <p className="theme-text text-sm font-bold">
                      Sumber laporan belum aktif
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm leading-6">
                      Laporan disusun dari{" "}
                      <code>GET /api/ppdb/pendaftar</code>,
                      tetapi server Backend yang berjalan
                      mengembalikan 404. Tidak ada angka
                      contoh yang ditampilkan.
                    </p>

                    <button
                      type="button"
                      onClick={() => muatUlang(true)}
                      className={`${themePrimaryGradient} mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95`}
                    >
                      <RefreshCw size={14} />
                      Coba Muat Ulang
                    </button>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="theme-danger mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="theme-text text-sm font-bold">
                      Gagal menyusun laporan
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
                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <Stat
                    title="Total Pendaftar"
                    value={statistikLaporan.total}
                  />

                  <Stat
                    title="Terverifikasi"
                    value={statistikLaporan.lulus}
                  />

                  <Stat
                    title="Menunggu"
                    value={statistikLaporan.menunggu}
                  />

                  <Stat
                    title="Ditolak"
                    value={statistikLaporan.ditolak}
                  />

                  <Stat
                    title="Berkas Lengkap"
                    value={totalLengkap}
                  />
                </div>

                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="theme-text-muted text-xs">
                    {filterJalur === "Semua"
                      ? "Seluruh jalur pendaftaran"
                      : `Jalur: ${
                          daftarJalur.find(
                            (item) =>
                              item.id === filterJalur
                          )?.nama || "-"
                        }`}
                  </p>

                  <select
                    value={filterJalur}
                    onChange={(e) =>
                      setFilterJalur(e.target.value)
                    }
                    className={`theme-input theme-text theme-neutral-border h-10 rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                  >
                    <option value="Semua">
                      Semua Jalur
                    </option>

                    {daftarJalur.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {dataLaporan.length === 0 ? (
                  <div
                    className={`theme-card ${themeNeutralBorder} rounded-xl border px-6 py-16 text-center ${themeCardShadow}`}
                  >
                    <FileText
                      size={25}
                      className="theme-text-muted mx-auto"
                    />

                    <h2 className="theme-text mt-3 text-sm font-bold">
                      Belum ada data laporan
                    </h2>

                    <p className="theme-text-muted mx-auto mt-1 max-w-md text-xs leading-5">
                      Belum ada pendaftar pada filter yang
                      dipilih.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Panel
                      title="Rekap per Jalur"
                      description="Terisi dihitung dari pendaftar yang tidak ditolak."
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                          <thead>
                            <tr
                              className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                            >
                              <Th>Jalur</Th>
                              <Th align="right">Kuota</Th>
                              <Th align="right">Pendaftar</Th>
                              <Th align="right">Terverifikasi</Th>
                              <Th align="right">Menunggu</Th>
                              <Th align="right">Ditolak</Th>
                              <Th align="right">Sisa</Th>
                            </tr>
                          </thead>

                          <tbody>
                            {rekapJalur.map((item) => (
                              <tr
                                key={item.id}
                                className={`border-b ${themeDivider} last:border-0`}
                              >
                                <td className="theme-text px-4 py-3 text-xs font-semibold">
                                  {item.nama}
                                </td>

                                <td className="theme-text-secondary px-4 py-3 text-right text-xs">
                                  {formatAngka(item.kuota)}
                                </td>

                                <td className="theme-text px-4 py-3 text-right text-xs font-semibold">
                                  {formatAngka(item.total)}
                                </td>

                                <td className="px-4 py-3 text-right text-xs text-[var(--color-success)]">
                                  {formatAngka(item.lulus)}
                                </td>

                                <td className="px-4 py-3 text-right text-xs text-[var(--color-warning)]">
                                  {formatAngka(item.menunggu)}
                                </td>

                                <td className="theme-danger px-4 py-3 text-right text-xs">
                                  {formatAngka(item.ditolak)}
                                </td>

                                <td className="theme-text px-4 py-3 text-right text-xs font-semibold">
                                  {formatAngka(
                                    item.sisaKuota
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Panel>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <Panel
                        title="Rekap Berkas"
                        description={`${formatAngka(
                          totalLengkap
                        )} pendaftar memiliki ketiga berkas wajib.`}
                      >
                        <div className="space-y-3">
                          {rekapBerkas.map((item) => {
                            const total =
                              dataLaporan.length || 1;

                            const persen = Math.round(
                              (item.jumlah / total) * 100
                            );

                            return (
                              <div key={item.nama}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="theme-text font-semibold">
                                    {item.nama}
                                  </span>

                                  <span className="theme-text-secondary">
                                    {formatAngka(
                                      item.jumlah
                                    )}{" "}
                                    diunggah
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
                      </Panel>

                      <Panel
                        title="Rekap Seleksi"
                        description="Dihitung dari relasi hasil seleksi pada data pendaftar."
                      >
                        {rekapSeleksi.tersedia ? (
                          <>
                            <div className="space-y-3">
                              <Baris
                                label="Sudah ada hasil"
                                value={formatAngka(
                                  rekapSeleksi.sudahAdaHasil
                                )}
                              />

                              <Baris
                                label="Belum ada hasil"
                                value={formatAngka(
                                  rekapSeleksi.belumAdaHasil
                                )}
                              />

                              <Baris
                                label="Sudah dinilai"
                                value={formatAngka(
                                  rekapSeleksi.jumlahDinilai
                                )}
                              />

                              <Baris
                                label="Rata-rata nilai tes"
                                value={formatNilai(
                                  rekapSeleksi.rataNilaiTes
                                )}
                              />
                            </div>

                            {rekapSeleksi.statusKelulusan
                              .length > 0 && (
                          <div
                            className={`mt-4 border-t ${themeDivider} pt-3`}
                          >
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                              Status kelulusan
                            </p>

                            <div className="mt-2 space-y-1.5">
                              {rekapSeleksi.statusKelulusan.map(
                                (item) => (
                                  <Baris
                                    key={item.label}
                                    label={item.label}
                                    value={formatAngka(
                                      item.jumlah
                                    )}
                                  />
                                )
                              )}
                            </div>
                          </div>
                        )}
                          </>
                        ) : (
                          <p className="theme-text-muted text-xs leading-5">
                            Respons daftar dari Backend ini
                            tidak menyertakan{" "}
                            <code>hasilSeleksiPpdb</code>,
                            sehingga rekap seleksi belum
                            dapat dihitung dari daftar.
                            Nilai dan peringkat tersedia
                            melalui endpoint detail dan dapat
                            dimuat dari halaman Seleksi.
                            Kolom hasil pada ekspor CSV juga
                            akan kosong.
                          </p>
                        )}
                      </Panel>
                    </div>

                    <p className="theme-text-muted text-[11px] leading-5">
                      Sumber: GET /api/ppdb/pendaftar (
                      {formatAngka(jumlahHalaman)} halaman
                      dimuat, {formatAngka(
                        dataLaporan.length
                      )}{" "}
                      baris pada laporan).
                      {dimuatPada
                        ? ` Dimuat ${formatTanggalJam(
                            dimuatPada
                          )}.`
                        : ""}
                      {terpotong
                        ? " Sebagian data tidak dimuat karena melebihi batas halaman, sehingga rekap belum mencakup seluruh pendaftar."
                        : ""}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-5 ${themeCardShadow}`}
    >
      <div className="mb-4">
        <h2 className="theme-text text-sm font-bold">
          {title}
        </h2>

        {description && (
          <p className="theme-text-muted mt-1 text-xs">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

function Baris({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="theme-text-secondary capitalize">
        {label}
      </span>

      <span className="theme-text font-semibold">
        {value}
      </span>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-4 ${themeCardShadow}`}
    >
      <p className="theme-text-muted text-xs">{title}</p>

      <p className="theme-text mt-1 text-2xl font-bold">
        {formatAngka(value)}
      </p>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      className={`theme-text-muted px-4 py-3 text-[10px] font-semibold uppercase tracking-wider ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
