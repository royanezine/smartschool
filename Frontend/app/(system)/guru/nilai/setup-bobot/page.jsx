"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Info,
  Loader2,
  LockKeyhole,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getKomponenNilai, getNilaiKelasSaya } from "@/services/nilai.service";

const formatPercent = (value) => `${Number(value) || 0}%`;

export default function SetupBobotPage() {
  const router = useRouter();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [komponenData, setKomponenData] = useState({
    komponen: [],
    totalBobot: 0,
    sisaBobot: 100,
    status: "draft",
  });

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingKomponen, setLoadingKomponen] = useState(false);

  const [error, setError] = useState("");

  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    setError("");

    try {
      const data = await getNilaiKelasSaya();

      setClasses(data);

      setSelectedClassId((current) => {
        if (current && data.some((item) => item.kelasMapelId === current)) {
          return current;
        }

        return data[0]?.kelasMapelId || "";
      });
    } catch (err) {
      console.error("Gagal mengambil kelas nilai:", err);
      setClasses([]);
      setSelectedClassId("");
      setError(
        err?.message ||
          "Gagal mengambil daftar kelas yang diampu. Pastikan backend berjalan dan akun memiliki akses guru."
      );
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClasses();
  }, [loadClasses]);

  const loadKomponen = useCallback(async (kelasMapelId) => {
    if (!kelasMapelId) {
      setKomponenData({
        komponen: [],
        totalBobot: 0,
        sisaBobot: 100,
        status: "draft",
      });
      return;
    }

    setLoadingKomponen(true);
    setError("");

    try {
      const result = await getKomponenNilai(kelasMapelId);
      setKomponenData(result);
    } catch (err) {
      console.error("Gagal mengambil komponen nilai:", err);
      setKomponenData({
        komponen: [],
        totalBobot: 0,
        sisaBobot: 100,
        status: "draft",
      });
      setError(
        err?.message ||
          "Gagal mengambil komponen penilaian. Pastikan kelas ini masih diampu oleh akun Anda."
      );
    } finally {
      setLoadingKomponen(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKomponen(selectedClassId);
  }, [selectedClassId, loadKomponen]);

  const selectedClass = classes.find(
    (item) => item.kelasMapelId === selectedClassId
  );

  const components = useMemo(
    () => (Array.isArray(komponenData?.komponen) ? komponenData.komponen : []),
    [komponenData]
  );

  const totalWeight = Number(komponenData?.totalBobot) || 0;
  const sisaBobot =
    typeof komponenData?.sisaBobot === "number"
      ? komponenData.sisaBobot
      : Math.max(0, Math.round((100 - totalWeight) * 100) / 100);

  const isFinalized =
    komponenData.status === "final" || selectedClass?.status === "final";

  const isValid =
    components.length > 0 && totalWeight === 100 && !isFinalized;

  const simulasiNilai = useMemo(
    () =>
      components.reduce(
        (total, component) => total + (80 * Number(component.bobot)) / 100,
        0
      ),
    [components]
  );

  const subjectLabel = selectedClass
    ? `${selectedClass.mataPelajaran?.nama || "-"} · ${
        selectedClass.kelas?.nama || "-"
      }`
    : "Pilih mata pelajaran";

  const showLoading = loadingClasses || loadingKomponen;

  return (
    <div className="flex min-h-screen w-full theme-page">
      <Sidebar role="guru" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: "Guru" }} />

        <main className="theme-page flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
            <div className="mb-8 flex flex-col gap-5 border-b border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                    <SlidersHorizontal size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      PENILAIAN / KONFIGURASI
                    </p>
                    <h1 className="theme-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                      Setup Bobot
                    </h1>
                  </div>
                </div>

                <p className="theme-text-secondary mt-3 max-w-2xl text-sm leading-6">
                  Tinjau komponen penilaian dan bobot aktual yang tersimpan di
                  backend untuk setiap kelas dan mata pelajaran. Pastikan total
                  bobot mencapai 100% sebelum finalisasi nilai.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/guru/nilai/finalisasi")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_14%,transparent)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                >
                  <ClipboardList size={15} />
                  Halaman finalisasi
                </button>

                <button
                  type="button"
                  onClick={() => loadKomponen(selectedClassId)}
                  disabled={showLoading || !selectedClassId}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Muat ulang data
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <p className="text-sm leading-6 text-[var(--color-danger)]">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadClasses}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                >
                  <RefreshCw size={14} />
                  Muat ulang
                </button>
              </div>
            )}

            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Total komponen
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {showLoading ? "—" : components.length}
                    </p>
                  </div>
                  <ClipboardList
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Komponen aktif di database
                </p>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Total bobot
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {showLoading ? "—" : totalWeight}
                      <span className="ml-1 text-base font-medium">%</span>
                    </p>
                  </div>
                  <Calculator
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_9%,transparent)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(Math.max(totalWeight, 0), 100)}%`,
                      backgroundColor: totalWeight === 100 ? "#0D9488" : "#2563EB",
                    }}
                  />
                </div>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Sisa kuota bobot
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {showLoading ? "—" : sisaBobot}
                      <span className="ml-1 text-base font-medium">%</span>
                    </p>
                  </div>
                  <SlidersHorizontal
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  {sisaBobot === 0
                    ? "Seluruh kuota bobot 100% sudah terpakai"
                    : `Sisa ${sisaBobot}% belum dialokasikan pada komponen`}
                </p>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Status konfigurasi
                    </p>
                    <p className="theme-text mt-2 text-lg font-bold">
                      {showLoading
                        ? "Memuat..."
                        : isFinalized
                          ? "Sudah difinalisasi"
                          : isValid
                            ? "Siap difinalisasi"
                            : "Perlu penyesuaian"}
                    </p>
                  </div>

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isFinalized
                        ? "bg-teal-500/10 text-teal-600"
                        : isValid
                          ? "bg-teal-500/10 text-teal-600"
                          : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {isFinalized ? (
                      <LockKeyhole size={16} />
                    ) : isValid ? (
                      <Check size={17} />
                    ) : (
                      <Info size={17} />
                    )}
                  </span>
                </div>

                <p className="theme-text-secondary mt-3 text-xs">
                  {showLoading
                    ? "Mengambil komponen dari backend..."
                    : isFinalized
                      ? "Nilai sudah difinalisasi dan konfigurasi terkunci."
                      : isValid
                        ? "Total bobot tepat 100%, siap difinalisasi."
                        : "Total bobot belum mencapai 100%."}
                </p>
              </article>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="theme-card min-w-0 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
                <div className="flex flex-col gap-4 border-b border-[color-mix(in_srgb,var(--color-text)_9%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="theme-text font-bold">
                      Komposisi penilaian
                    </h2>
                    <p className="theme-text-secondary mt-1 text-sm">
                      Komponen yang tersimpan pada backend untuk kelas-mapel
                      ini.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    <LockKeyhole size={13} />
                    {subjectLabel}
                  </span>
                </div>

                <div className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:px-6">
                  <label
                    htmlFor="subject"
                    className="theme-text mb-2 block text-sm font-semibold"
                  >
                    Mata pelajaran dan kelas
                  </label>

                  <div className="relative max-w-lg">
                    <BookOpen
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />

                    <select
                      id="subject"
                      value={selectedClassId}
                      onChange={(event) => {
                        setSelectedClassId(event.target.value);
                      }}
                      disabled={loadingClasses || classes.length === 0}
                      className="theme-input w-full appearance-none rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {classes.length === 0 && (
                        <option value="">
                          {loadingClasses
                            ? "Memuat kelas..."
                            : "Belum ada kelas yang diampu"}
                        </option>
                      )}

                      {classes.map((item) => (
                        <option
                          key={item.kelasMapelId}
                          value={item.kelasMapelId}
                        >
                          {item.mataPelajaran?.nama || "-"} —{" "}
                          {item.kelas?.nama || "-"}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />
                  </div>

                  {selectedClass && (
                    <p className="theme-text-secondary mt-2 text-xs">
                      {selectedClass.kelas?._count?.anggota ?? 0} siswa ·{" "}
                      {selectedClass.mataPelajaran?.kode
                        ? `Kode mapel ${selectedClass.mataPelajaran.kode}`
                        : "Kelas-mapel terdaftar"}
                    </p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[570px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                        <th className="theme-text-secondary px-5 py-3.5 font-semibold sm:px-6">
                          Komponen
                        </th>
                        <th className="theme-text-secondary w-36 px-4 py-3.5 font-semibold">
                          Bobot (%)
                        </th>
                        <th className="theme-text-secondary w-32 px-4 py-3.5 font-semibold">
                          Proporsi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {showLoading && (
                        <tr>
                          <td colSpan={3} className="px-5 py-12 text-center">
                            <Loader2
                              size={24}
                              className="theme-text-secondary mx-auto animate-spin"
                            />
                            <p className="theme-text-secondary mt-3 text-sm">
                              Memuat komponen nilai...
                            </p>
                          </td>
                        </tr>
                      )}

                      {!showLoading &&
                        components.map((component) => (
                          <tr
                            key={component.id}
                            className="border-b border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] last:border-b-0"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-9 w-1 shrink-0 rounded-full"
                                  style={{ backgroundColor: "#2563EB" }}
                                />
                                <div>
                                  <p className="theme-text font-semibold">
                                    {component.nama}
                                  </p>
                                  <p className="theme-text-secondary mt-1 text-xs">
                                    {component.jenis || "lainnya"} ·{" "}
                                    {component.kelompok || "umum"} · maks.{" "}
                                    {component.nilaiMaksimum ?? 100}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="theme-text inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] px-3 py-2 text-sm font-semibold tabular-nums">
                                <LockKeyhole
                                  size={13}
                                  className="theme-text-secondary"
                                />
                                {formatPercent(component.bobot)}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_9%,transparent)]">
                                  <div
                                    className="h-full rounded-full bg-[var(--color-primary)]"
                                    style={{
                                      width: `${Math.min(
                                        Number(component.bobot) || 0,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="theme-text-secondary text-xs tabular-nums">
                                  {formatPercent(component.bobot)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!showLoading &&
                        !error &&
                        components.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-5 py-12 text-center">
                              <Info
                                size={24}
                                className="theme-text-secondary mx-auto"
                              />
                              <p className="theme-text mt-3 text-sm font-semibold">
                                {classes.length === 0
                                  ? "Belum ada kelas yang diampu"
                                  : "Belum ada komponen nilai"}
                              </p>
                              <p className="theme-text-secondary mt-1 text-xs">
                                {classes.length === 0
                                  ? "Akun guru ini belum ditugaskan pada kelas-mapel mana pun."
                                  : "Backend belum menyimpan komponen penilaian untuk kelas-mapel ini."}
                              </p>
                            </td>
                          </tr>
                        )}
                    </tbody>

                    <tfoot>
                      <tr className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                        <td className="theme-text px-5 py-4 font-bold sm:px-6">
                          Total bobot
                        </td>
                        <td
                          className={`px-4 py-4 font-bold tabular-nums ${
                            totalWeight === 100
                              ? "text-teal-600"
                              : "text-amber-600"
                          }`}
                        >
                          {totalWeight}%
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              totalWeight === 100
                                ? "text-teal-600"
                                : "text-amber-600"
                            }`}
                          >
                            {totalWeight === 100 ? (
                              <Check size={14} />
                            ) : (
                              <Info size={14} />
                            )}
                            {totalWeight === 100
                              ? "Sesuai"
                              : totalWeight > 100
                                ? `Kelebihan ${Math.abs(sisaBobot)}%`
                                : `Sisa ${sisaBobot}%`}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="theme-text-secondary flex items-start gap-2 text-xs leading-5">
                    <CircleHelp size={15} className="mt-0.5 shrink-0" />
                    {isFinalized
                      ? "Kelas ini telah difinalisasi di backend sehingga seluruh komponen terkunci."
                      : totalWeight === 100
                        ? "Total bobot telah mencapai 100% dan tersimpan di database."
                        : `Total bobot saat ini ${totalWeight}%. Sisa ${sisaBobot}% belum dialokasikan pada komponen mana pun.`}
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/guru/nilai/finalisasi")}
                    disabled={!isValid && !isFinalized}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={15} />
                    {isFinalized ? "Halaman finalisasi" : "Lanjut ke finalisasi"}
                  </button>
                </div>
              </section>

              <aside className="space-y-5">
                <section className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                  <div className="flex items-center gap-2">
                    <Calculator
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                    <h2 className="theme-text font-bold">
                      Simulasi nilai akhir
                    </h2>
                  </div>

                  <p className="theme-text-secondary mt-2 text-xs leading-5">
                    Contoh perhitungan jika nilai setiap komponen adalah 80.
                  </p>

                  <div className="mt-5 space-y-4">
                    {components.length === 0 && (
                      <p className="theme-text-secondary text-xs">
                        Belum ada komponen untuk disimulasikan.
                      </p>
                    )}

                    {components.map((component) => (
                      <div key={component.id}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="theme-text-secondary text-xs">
                            {component.nama}
                          </span>
                          <span className="theme-text text-xs font-semibold tabular-nums">
                            {(
                              (80 * Number(component.bobot)) /
                              100
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-primary)]"
                            style={{
                              width: `${Math.min(
                                Number(component.bobot) || 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-[color-mix(in_srgb,var(--color-text)_9%,transparent)] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-sm">
                        Nilai akhir simulasi
                      </span>
                      <span className="theme-text text-2xl font-bold tabular-nums">
                        {simulasiNilai.toFixed(1)}
                      </span>
                    </div>
                    <p className="theme-text-secondary mt-2 text-xs">
                      Skala 0–100, dengan nilai contoh 80 pada setiap komponen.
                    </p>
                  </div>
                </section>

                <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-background))] p-5">
                  <div className="flex items-center gap-2">
                    <Info
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                    <h2 className="theme-text text-sm font-bold">
                      Catatan komponen
                    </h2>
                  </div>

                  <ul className="theme-text-secondary mt-3 space-y-2.5 text-xs leading-5">
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Seluruh bobot pada halaman ini dibaca langsung dari
                      backend sesuai kelas-mapel yang dipilih.
                    </li>
                    <li className="flex gap-2">
                      <Info
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Halaman ini bersifat baca saja: komponen dan bobot yang
                      sudah tersimpan tidak dapat diubah dari sini.
                    </li>
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Total bobot harus tepat 100% sebelum finalisasi.
                    </li>
                    <li className="flex gap-2">
                      <LockKeyhole
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Nilai yang sudah difinalisasi tidak dapat diubah.
                    </li>
                  </ul>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
