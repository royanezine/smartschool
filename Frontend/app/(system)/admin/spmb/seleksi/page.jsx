"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { muatDetailPendaftarPpdb } from "@/services/ppdb.service";

import { useSpmbRekap } from "@/lib/useSpmbRekap";
import {
  formatAngka,
  formatNilai,
  hitungRekapSeleksi,
  normalisasiStatusPendaftaran,
} from "@/lib/spmb";

const LIMIT_SELEKSI = 20;

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function angkaPeringkat(value) {
  const angka = Number(value);

  return Number.isFinite(angka) && angka > 0
    ? angka
    : null;
}

function angkaNilai(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const angka = Number(value);

  return Number.isFinite(angka) ? angka : null;
}

export default function SeleksiSpmbPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterHasil, setFilterHasil] = useState("Semua");
  const [halaman, setHalaman] = useState(1);
  const [detailMap, setDetailMap] = useState({});
  const [memuatHasil, setMemuatHasil] = useState(false);
  const [progresHasil, setProgresHasil] = useState({
    selesai: 0,
    total: 0,
  });
  const [hasilError, setHasilError] = useState("");

  const {
    pendaftar,
    statistik,
    loading,
    refreshing,
    error,
    endpointUnavailable,
    muatUlang,
  } = useSpmbRekap();

  const rekapDaftar = useMemo(
    () => hitungRekapSeleksi(pendaftar),
    [pendaftar]
  );

  const butuhMuatHasil = !rekapDaftar.tersedia;

  const detailSudahDimuat =
    Object.keys(detailMap).length > 0;

  const dataSeleksi = useMemo(() => {
    if (!butuhMuatHasil || !detailSudahDimuat) {
      return pendaftar;
    }

    return pendaftar.map((item) => {
      const detail = item?.id
        ? detailMap[item.id]
        : null;

      return detail
        ? { ...item, ...detail }
        : item;
    });
  }, [
    pendaftar,
    butuhMuatHasil,
    detailSudahDimuat,
    detailMap,
  ]);

  const rekapSeleksi = useMemo(
    () => hitungRekapSeleksi(dataSeleksi),
    [dataSeleksi]
  );

  const metrikHasilTersedia =
    !butuhMuatHasil || detailSudahDimuat;

  const baris = useMemo(() => {
    const kataKunci = search.trim().toLowerCase();

    return dataSeleksi
      .map((item) => {
        const hasil = item?.hasilSeleksiPpdb;
        const detailDimuat =
          !butuhMuatHasil ||
          !item?.id ||
          Boolean(detailMap[item.id]);

        return {
          item,
          nama: item?.namaLengkap || "-",
          nomor: item?.nomorPendaftaran || "-",
          jalur: item?.jalurPpdb?.nama || "-",
          peringkat: angkaPeringkat(hasil?.peringkat),
          nilaiTes: angkaNilai(hasil?.nilaiTes),
          statusKelulusan: String(
            hasil?.statusKelulusan || ""
          ).trim(),
          adaHasil: Boolean(hasil),
          detailDimuat,
          statusPendaftaran:
            normalisasiStatusPendaftaran(
              item?.status
            ).key,
        };
      })
      .filter((barisItem) => {
        if (filterHasil === "Sudah ada hasil") {
          return barisItem.adaHasil;
        }

        if (filterHasil === "Belum ada hasil") {
          return !barisItem.adaHasil;
        }

        return true;
      })
      .filter((barisItem) => {
        if (!kataKunci) {
          return true;
        }

        return [
          barisItem.nama,
          barisItem.nomor,
          barisItem.jalur,
          barisItem.statusKelulusan,
        ].some((nilai) =>
          String(nilai)
            .toLowerCase()
            .includes(kataKunci)
        );
      })
      .sort((a, b) => {
        const peringkatA = a.peringkat ?? Infinity;
        const peringkatB = b.peringkat ?? Infinity;

        if (peringkatA !== peringkatB) {
          return peringkatA - peringkatB;
        }

        const nilaiA = a.nilaiTes ?? -Infinity;
        const nilaiB = b.nilaiTes ?? -Infinity;

        if (nilaiA !== nilaiB) {
          return nilaiB - nilaiA;
        }

        return a.nama.localeCompare(b.nama, "id");
      });
  }, [
    dataSeleksi,
    search,
    filterHasil,
    butuhMuatHasil,
    detailMap,
  ]);

  const totalHalaman = Math.max(
    1,
    Math.ceil(baris.length / LIMIT_SELEKSI)
  );

  const halamanAktif = Math.min(
    halaman,
    totalHalaman
  );

  const barisHalaman = useMemo(() => {
    const mulai =
      (halamanAktif - 1) * LIMIT_SELEKSI;

    return baris.slice(
      mulai,
      mulai + LIMIT_SELEKSI
    );
  }, [baris, halamanAktif]);

  function ubahFilter(setter, value) {
    setter(value);
    setHalaman(1);
  }

  async function muatHasilSeleksi() {
    const ids = pendaftar
      .map((item) => item?.id)
      .filter(Boolean);

    if (ids.length === 0 || memuatHasil) {
      return;
    }

    setMemuatHasil(true);
    setHasilError("");
    setProgresHasil({
      selesai: 0,
      total: ids.length,
    });

    try {
      const result = await muatDetailPendaftarPpdb(
        ids,
        {
          batasParalel: 4,
          onProgress: (selesai, total) =>
            setProgresHasil({ selesai, total }),
        }
      );

      const peta = {};

      result.data.forEach((detail) => {
        if (detail?.id) {
          peta[detail.id] = detail;
        }
      });

      setDetailMap((sebelumnya) => ({
        ...sebelumnya,
        ...peta,
      }));

      if (result.gagal.length > 0) {
        setHasilError(
          `${result.gagal.length} detail pendaftar gagal dimuat, sehingga hasilnya belum tampil.`
        );
      }
    } catch (err) {
      setHasilError(
        err instanceof Error
          ? err.message
          : "Gagal memuat hasil seleksi dari detail pendaftar."
      );
    } finally {
      setMemuatHasil(false);
    }
  }

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
                  <GraduationCap size={21} />
                </div>

                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Seleksi SPMB
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm leading-6">
                    Nilai tes, peringkat, dan status
                    kelulusan dari hasil seleksi resmi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => muatUlang(true)}
                disabled={refreshing}
                className={`${themePrimaryGradient} inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
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

            <div
              className={`theme-card ${themeNeutralBorder} mb-4 flex items-start gap-2.5 rounded-xl border p-4 ${themeCardShadow}`}
            >
              <Info
                size={15}
                className={`mt-0.5 shrink-0 ${themePrimaryText}`}
              />

              <p className="theme-text-secondary text-xs leading-5">
                Halaman ini hanya membaca hasil seleksi
                yang menempel pada data pendaftar. Backend
                belum menyediakan endpoint untuk
                menetapkan nilai tes, peringkat, atau
                status kelulusan, sehingga tidak ada aksi
                ubah di sini. Verifikasi kelulusan
                pendaftaran dilakukan terpisah di menu
                Data Pendaftaran.
              </p>
            </div>

            {!loading &&
              !endpointUnavailable &&
              !error &&
              butuhMuatHasil && (
                <div className="mb-4 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-2.5">
                      <Info
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                      />

                      <div>
                        <p className="theme-text text-xs font-bold">
                          Respons daftar tidak menyertakan
                          hasil seleksi
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Endpoint daftar versi Backend
                          ini hanya mengirim data
                          pendaftaran. Nilai tes, peringkat,
                          dan status kelulusan tersedia di
                          endpoint detail{" "}
                          <code>
                            GET
                            /api/ppdb/pendaftar/:id
                          </code>
                          . Muat detail untuk seluruh
                          peserta agar tabel seleksi terisi.
                        </p>

                        {memuatHasil && (
                          <div className="mt-3 max-w-xs">
                            <p className="theme-text-muted text-[11px]">
                              Memuat{" "}
                              {progresHasil.selesai}/
                              {progresHasil.total} detail...
                            </p>

                            <div
                              className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
                            >
                              <div
                                className="h-full rounded-full bg-[var(--color-warning)]"
                                style={{
                                  width: `${
                                    progresHasil.total
                                      ? Math.round(
                                          (progresHasil.selesai /
                                            progresHasil
                                              .total) *
                                            100
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {detailSudahDimuat &&
                          !memuatHasil && (
                            <p className="mt-2 text-[11px] font-semibold text-[var(--color-success)]">
                              Hasil seleksi dimuat dari
                              detail untuk{" "}
                              {Object.keys(detailMap).length}{" "}
                              peserta.
                            </p>
                          )}

                        {hasilError && (
                          <p className="theme-danger mt-2 text-[11px]">
                            {hasilError}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={muatHasilSeleksi}
                      disabled={memuatHasil}
                      className={`${themePrimaryGradient} inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {memuatHasil ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {memuatHasil
                        ? "Memuat..."
                        : detailSudahDimuat
                          ? "Muat Ulang"
                          : "Muat Hasil Seleksi"}
                    </button>
                  </div>
                </div>
              )}

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={28}
                    className={`${themePrimaryText} mx-auto animate-spin`}
                  />

                  <p className="theme-text-muted mt-3 text-xs font-medium">
                    Memuat data seleksi...
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
                      Data seleksi belum dapat dibaca
                    </p>

                    <p className="theme-text-secondary mt-1 text-sm leading-6">
                      Server Backend yang sedang berjalan
                      mengembalikan 404 untuk{" "}
                      <code>GET /api/ppdb/pendaftar</code>.
                      Daftar peserta belum dapat dibaca,
                      sehingga nilai dan peringkat belum
                      dapat dimuat.
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
                      Gagal memuat data seleksi
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
                    title="Peserta"
                    value={statistik?.total}
                  />

                  <Stat
                    title="Sudah Ada Hasil"
                    value={
                      metrikHasilTersedia
                        ? rekapSeleksi.sudahAdaHasil
                        : "-"
                    }
                  />

                  <Stat
                    title="Sudah Dinilai"
                    value={
                      metrikHasilTersedia
                        ? rekapSeleksi.jumlahDinilai
                        : "-"
                    }
                  />

                  <Stat
                    title="Rata-rata Nilai"
                    value={
                      metrikHasilTersedia
                        ? formatNilai(
                            rekapSeleksi.rataNilaiTes
                          )
                        : "-"
                    }
                  />
                </div>

                {rekapSeleksi.statusKelulusan.length >
                  0 && (
                  <div
                    className={`theme-card ${themeNeutralBorder} mt-4 rounded-xl border p-4 ${themeCardShadow}`}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy
                        size={15}
                        className={themePrimaryText}
                      />

                      <p className="theme-text text-xs font-semibold">
                        Rekap status kelulusan
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {rekapSeleksi.statusKelulusan.map(
                        (item) => (
                          <span
                            key={item.label}
                            className={`${themeNeutralSurface} ${themeNeutralBorder} rounded-md border px-2.5 py-1 text-[10px] font-semibold capitalize theme-text-secondary`}
                          >
                            {item.label}:{" "}
                            {formatAngka(item.jumlah)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`theme-card ${themeNeutralBorder} mt-4 flex min-h-0 flex-col overflow-hidden rounded-xl border ${themeCardShadow}`}
                >
                  <div
                    className={`flex shrink-0 flex-col gap-3 border-b ${themeDivider} p-4 sm:flex-row`}
                  >
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <input
                        value={search}
                        onChange={(e) =>
                          ubahFilter(
                            setSearch,
                            e.target.value
                          )
                        }
                        placeholder="Cari nama, nomor pendaftaran, jalur..."
                        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} pl-9 pr-3 text-xs outline-none transition ${themeFocus}`}
                      />
                    </div>

                    <select
                      value={filterHasil}
                      onChange={(e) =>
                        ubahFilter(
                          setFilterHasil,
                          e.target.value
                        )
                      }
                      disabled={!metrikHasilTersedia}
                      title={
                        metrikHasilTersedia
                          ? undefined
                          : "Muat hasil seleksi terlebih dahulu untuk memakai filter ini"
                      }
                      className={`theme-input theme-text theme-neutral-border h-10 rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <option value="Semua">
                        Semua Peserta
                      </option>

                      <option value="Sudah ada hasil">
                        Sudah Ada Hasil
                      </option>

                      <option value="Belum ada hasil">
                        Belum Ada Hasil
                      </option>
                    </select>
                  </div>

                  {baris.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                      <GraduationCap
                        size={25}
                        className="theme-text-muted mx-auto"
                      />

                      <h2 className="theme-text mt-3 text-sm font-bold">
                        Belum ada peserta seleksi
                      </h2>

                      <p className="theme-text-muted mx-auto mt-1 max-w-md text-xs leading-5">
                        {pendaftar.length === 0
                          ? "Belum ada pendaftar pada sekolah ini."
                          : "Tidak ada peserta yang sesuai dengan pencarian atau filter."}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[920px]">
                        <thead>
                          <tr
                            className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                          >
                            <Th>Peringkat</Th>
                            <Th>Peserta</Th>
                            <Th>Jalur</Th>
                            <Th>Nilai Tes</Th>
                            <Th>Status Kelulusan</Th>
                            <Th>Status Pendaftaran</Th>
                          </tr>
                        </thead>

                        <tbody>
                          {barisHalaman.map((barisItem) => {
                            const statusPendaftaran =
                              normalisasiStatusPendaftaran(
                                barisItem.item.status
                              );

                            return (
                              <tr
                                key={
                                  barisItem.item.id ||
                                  barisItem.nomor
                                }
                                className={`border-b ${themeDivider} last:border-0 ${themeNeutralHover}`}
                              >
                                <td className="px-4 py-3">
                                  {barisItem.peringkat ? (
                                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] px-2 text-xs font-bold text-[var(--color-primary)]">
                                      #
                                      {barisItem.peringkat}
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-xs">
                                      -
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-3">
                                  <p className="theme-text text-xs font-semibold">
                                    {barisItem.nama}
                                  </p>

                                  <p className="theme-text-muted text-[10px]">
                                    {barisItem.nomor}
                                  </p>
                                </td>

                                <td className="theme-text-secondary px-4 py-3 text-xs">
                                  {barisItem.jalur}
                                </td>

                                <td className="theme-text px-4 py-3 text-xs font-semibold">
                                  {formatNilai(
                                    barisItem.nilaiTes
                                  )}
                                </td>

                                <td className="px-4 py-3">
                                  <StatusKelulusan
                                    status={
                                      barisItem.statusKelulusan
                                    }
                                    adaHasil={
                                      barisItem.adaHasil
                                    }
                                    belumDimuat={
                                      !barisItem.detailDimuat
                                    }
                                  />
                                </td>

                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
                                      statusPendaftaran.key ===
                                      "lulus"
                                        ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
                                        : statusPendaftaran.key ===
                                            "ditolak"
                                          ? "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-danger"
                                          : "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]"
                                    }`}
                                  >
                                    {
                                      statusPendaftaran.label
                                    }
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div
                    className={`flex shrink-0 flex-col gap-2 border-t ${themeDivider} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <p className="theme-text-muted text-xs">
                      Menampilkan{" "}
                      {barisHalaman.length} dari{" "}
                      {formatAngka(baris.length)} peserta
                      {totalHalaman > 1 && (
                        <>
                          {" "}
                          • Halaman {halamanAktif}/
                          {totalHalaman}
                        </>
                      )}
                    </p>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setHalaman((value) =>
                            Math.max(1, value - 1)
                          )
                        }
                        disabled={halamanAktif <= 1}
                        className={`theme-neutral-border theme-text-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <span
                        className={`${themePrimaryGradient} inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-[var(--color-card)]`}
                      >
                        {halamanAktif}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setHalaman((value) =>
                            Math.min(
                              totalHalaman,
                              value + 1
                            )
                          )
                        }
                        disabled={
                          halamanAktif >= totalHalaman
                        }
                        className={`theme-neutral-border theme-text-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/spmb/data-pendaftaran"
                    )
                  }
                  className={`${themePrimaryText} mt-3 inline-flex items-center gap-1 text-xs font-semibold`}
                >
                  Buka Data Pendaftaran untuk verifikasi
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusKelulusan({ status, adaHasil, belumDimuat }) {
  if (belumDimuat) {
    return (
      <span
        className={`${themeNeutralSurface} ${themeNeutralBorder} inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold theme-text-muted`}
      >
        Belum dimuat
      </span>
    );
  }

  if (!adaHasil) {
    return (
      <span
        className={`${themeNeutralSurface} ${themeNeutralBorder} inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold theme-text-muted`}
      >
        Belum ada hasil
      </span>
    );
  }

  if (!status) {
    return (
      <span className="inline-flex rounded-md border border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-warning)]">
        Belum ditetapkan
      </span>
    );
  }

  const value = status.toLowerCase();

  const negatif =
    value.includes("tidak") ||
    value.includes("ditolak") ||
    value.includes("gagal");

  const positif =
    !negatif &&
    (value.includes("lulus") ||
      value.includes("diterima"));

  const className = negatif
    ? "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-danger"
    : positif
      ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
      : "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]";

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold capitalize ${className}`}
    >
      {status}
    </span>
  );
}

function Stat({ title, value }) {
  return (
    <div
      className={`theme-card ${themeNeutralBorder} rounded-xl border p-4 ${themeCardShadow}`}
    >
      <p className="theme-text-muted text-xs">{title}</p>

      <p className="theme-text mt-1 text-2xl font-bold">
        {typeof value === "string"
          ? value
          : formatAngka(value)}
      </p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}
