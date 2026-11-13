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
  Plus,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  createKomponenNilai,
  getKomponenNilai,
  getNilaiKelasSaya,
} from "@/services/nilai.service";

// Semua warna memakai token tema (--color-*) supaya ikut perubahan dari CMS.
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

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

const themeTrack = "bg-[color-mix(in_srgb,var(--color-text)_9%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// Pengganti class `theme-input`: input mengikuti token tema, sama seperti Log Aktivitas.
const themeInput = `border ${themeNeutralBorder} ${themeNeutralSurface} theme-text outline-none ${themeFocus}`;

const formatPercent = (value) => `${Number(value) || 0}%`;

// Semua StatCard memakai warna primary yang sama, sama seperti halaman Log Aktivitas.
function StatCard({ label, value, description, icon: Icon, children }) {
  return (
    <article
      className={`min-w-0 rounded-2xl border theme-border theme-card p-4 ${themeCardShadow}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
            {label}
          </p>
          <p className="truncate text-lg font-semibold theme-text">{value}</p>
        </div>
      </div>

      {children}

      <p className="mt-3 break-words text-[11px] leading-4 theme-text-muted">
        {description}
      </p>
    </article>
  );
}

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
  const [notice, setNotice] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formKomponen, setFormKomponen] = useState({
    nama: "",
    jenis: "tugas",
    bobot: "",
    nilaiMaksimum: "100",
    kelompok: "umum",
  });

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

  const isValid = components.length > 0 && totalWeight === 100 && !isFinalized;

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
  const canCreateKomponen =
    Boolean(selectedClassId) && !isFinalized && sisaBobot > 0;

  const handleOpenCreateModal = () => {
    setFormKomponen({
      nama: "",
      jenis: "tugas",
      bobot: sisaBobot > 0 ? String(Math.min(20, sisaBobot)) : "",
      nilaiMaksimum: "100",
      kelompok: "umum",
    });
    setCreateError("");
    setShowCreateModal(true);
  };

  const handleCreateKomponen = async (event) => {
    event.preventDefault();
    if (!selectedClassId) return;

    const namaTrim = formKomponen.nama.trim();
    const bobotNum = Number(formKomponen.bobot);
    const maksNum = Number(formKomponen.nilaiMaksimum || 100);

    if (!namaTrim) {
      setCreateError("Nama komponen wajib diisi.");
      return;
    }
    if (!Number.isFinite(bobotNum) || bobotNum <= 0 || bobotNum > 100) {
      setCreateError("Bobot harus berupa angka lebih dari 0 sampai 100.");
      return;
    }
    if (Math.round((totalWeight + bobotNum) * 100) / 100 > 100) {
      setCreateError(
        `Total bobot melebihi 100% (saat ini ${totalWeight}%, sisa ${sisaBobot}%).`
      );
      return;
    }
    if (!Number.isFinite(maksNum) || maksNum <= 0 || maksNum > 100) {
      setCreateError("Nilai maksimum harus antara 1 sampai 100.");
      return;
    }

    setCreating(true);
    setCreateError("");
    setError("");
    setNotice("");

    try {
      await createKomponenNilai({
        kelasMapelId: selectedClassId,
        nama: namaTrim,
        jenis: formKomponen.jenis.trim() || "lainnya",
        bobot: bobotNum,
        nilaiMaksimum: maksNum,
        kelompok: formKomponen.kelompok.trim() || "umum",
      });

      setShowCreateModal(false);
      setNotice(`Komponen "${namaTrim}" (${bobotNum}%) berhasil ditambahkan.`);
      await Promise.all([loadKomponen(selectedClassId), loadClasses()]);
    } catch (err) {
      setCreateError(
        err?.message || "Gagal menambahkan komponen nilai baru."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar role="guru" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={{ name: "Guru" }} />

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
            <div
              className={`mb-8 flex flex-col gap-5 border-b ${themeNeutralBorder} pb-6 lg:flex-row lg:items-end lg:justify-between`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft size={16} />
                  Kembali
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <SlidersHorizontal size={20} />
                  </div>

                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.16em] ${themePrimaryText}`}
                    >
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
                  onClick={() => router.push("/guru/nilai/finalisasi")}
                  className={`theme-text inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${themeNeutralBorder} ${themeNeutralHover}`}
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
              <div
                role="alert"
                className={`mb-6 flex flex-col gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}
              >
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
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border ${themeDangerBorder} px-3 py-2 text-xs font-semibold text-[var(--color-danger)] transition hover:opacity-80`}
                >
                  <RefreshCw size={14} />
                  Muat ulang
                </button>
              </div>
            )}

            <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total komponen"
                value={showLoading ? "—" : components.length}
                description="Komponen aktif di database"
                icon={ClipboardList}
              />

              <StatCard
                label="Total bobot"
                value={showLoading ? "—" : `${totalWeight}%`}
                description={
                  totalWeight === 100
                    ? "Total bobot sudah tepat 100%"
                    : "Total bobot belum mencapai 100%"
                }
                icon={Calculator}
              >
                <div
                  className={`mt-4 h-1.5 overflow-hidden rounded-full ${themeTrack}`}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(Math.max(totalWeight, 0), 100)}%`,
                      backgroundColor:
                        totalWeight === 100
                          ? "var(--color-success)"
                          : "var(--color-primary)",
                    }}
                  />
                </div>
              </StatCard>

              <StatCard
                label="Sisa kuota bobot"
                value={showLoading ? "—" : `${sisaBobot}%`}
                description={
                  sisaBobot === 0
                    ? "Seluruh kuota bobot 100% sudah terpakai"
                    : `Sisa ${sisaBobot}% belum dialokasikan pada komponen`
                }
                icon={SlidersHorizontal}
              />

              <StatCard
                label="Status konfigurasi"
                value={
                  showLoading
                    ? "Memuat..."
                    : isFinalized
                      ? "Sudah difinalisasi"
                      : isValid
                        ? "Siap difinalisasi"
                        : "Perlu penyesuaian"
                }
                description={
                  showLoading
                    ? "Mengambil komponen dari backend..."
                    : isFinalized
                      ? "Nilai sudah difinalisasi dan konfigurasi terkunci."
                      : isValid
                        ? "Total bobot tepat 100%, siap difinalisasi."
                        : "Total bobot belum mencapai 100%."
                }
                icon={isFinalized ? LockKeyhole : isValid ? Check : Info}
              />
            </section>

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section
                className={`theme-card min-w-0 overflow-hidden rounded-2xl border theme-border ${themeCardShadow}`}
              >
                <div
                  className={`flex flex-col gap-4 border-b ${themeDivider} p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
                >
                  <div>
                    <h2 className="theme-text font-bold">Komposisi penilaian</h2>
                    <p className="theme-text-secondary mt-1 text-sm">
                      Komponen yang tersimpan pada backend untuk kelas-mapel
                      ini.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`theme-text-secondary inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${themeNeutralBorder}`}
                    >
                      <LockKeyhole size={13} />
                      {subjectLabel}
                    </span>

                    <button
                      type="button"
                      disabled={!canCreateKomponen || showLoading}
                      onClick={handleOpenCreateModal}
                      title={
                        isFinalized
                          ? "Nilai sudah difinalisasi, komponen terkunci"
                          : sisaBobot <= 0
                            ? "Total bobot sudah 100%"
                            : "Tambah komponen penilaian baru"
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={14} />
                      Tambah Komponen
                    </button>
                  </div>
                </div>

                {notice && (
                  <div
                    role="status"
                    className="mx-5 mt-4 flex items-start justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700 sm:mx-6 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <span className="flex items-center gap-2">
                      <Check size={14} className="shrink-0" />
                      {notice}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotice("")}
                      aria-label="Tutup pemberitahuan"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className={`border-b ${themeDivider} p-5 sm:px-6`}>
                  <label
                    htmlFor="subject"
                    className="theme-text mb-2 block text-sm font-semibold"
                  >
                    Mata pelajaran dan kelas
                  </label>

                  <div className="relative max-w-lg">
                    <BookOpen
                      size={17}
                      className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <select
                      id="subject"
                      value={selectedClassId}
                      onChange={(event) => {
                        setSelectedClassId(event.target.value);
                      }}
                      disabled={loadingClasses || classes.length === 0}
                      className={`${themeInput} w-full appearance-none rounded-lg py-3 pl-10 pr-10 text-sm transition disabled:cursor-not-allowed disabled:opacity-60`}
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
                      className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
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
                      <tr className={`border-b ${themeDivider}`}>
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
                              className={`mx-auto animate-spin ${themePrimaryText}`}
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
                            className={`border-b ${themeDivider} transition last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <span className="h-9 w-1 shrink-0 rounded-full bg-[var(--color-primary)]" />
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
                              <span
                                className={`theme-text inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums ${themeNeutralBorder}`}
                              >
                                <LockKeyhole
                                  size={13}
                                  className="theme-text-muted"
                                />
                                {formatPercent(component.bobot)}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-1.5 w-14 overflow-hidden rounded-full ${themeTrack}`}
                                >
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

                      {!showLoading && !error && components.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-12 text-center">
                            <Info
                              size={24}
                              className="theme-text-muted mx-auto"
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
                      <tr className={themeNeutralSurface}>
                        <td className="theme-text px-5 py-4 font-bold sm:px-6">
                          Total bobot
                        </td>
                        <td
                          className={`px-4 py-4 font-bold tabular-nums ${
                            totalWeight === 100
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-warning)]"
                          }`}
                        >
                          {totalWeight}%
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              totalWeight === 100
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-warning)]"
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

                <div
                  className={`flex flex-col gap-3 border-t ${themeDivider} p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
                >
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

              <aside className="min-w-0 space-y-5">
                <section
                  className={`theme-card rounded-2xl border theme-border p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center gap-2">
                    <Calculator size={17} className={themePrimaryText} />
                    <h2 className="theme-text font-bold">Simulasi nilai akhir</h2>
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
                            {((80 * Number(component.bobot)) / 100).toFixed(2)}
                          </span>
                        </div>
                        <div
                          className={`h-1.5 overflow-hidden rounded-full ${themeTrack}`}
                        >
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

                  <div className={`mt-5 border-t ${themeDivider} pt-4`}>
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

                <section
                  className={`rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-5`}
                >
                  <div className="flex items-center gap-2">
                    <Info size={17} className={themePrimaryText} />
                    <h2 className="theme-text text-sm font-bold">
                      Catatan komponen
                    </h2>
                  </div>

                  <ul className="theme-text-secondary mt-3 space-y-2.5 text-xs leading-5">
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className={`mt-0.5 shrink-0 ${themePrimaryText}`}
                      />
                      Seluruh bobot pada halaman ini dibaca langsung dari
                      backend sesuai kelas-mapel yang dipilih.
                    </li>
                    <li className="flex gap-2">
                      <Info
                        size={14}
                        className={`mt-0.5 shrink-0 ${themePrimaryText}`}
                      />
                      Komponen baru dapat ditambahkan hingga total bobot 100%
                      sebelum finalisasi. Untuk komponen yang sudah tersimpan,
                      edit dan hapus masih bersifat baca saja karena belum
                      tersedia di backend.
                    </li>
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className={`mt-0.5 shrink-0 ${themePrimaryText}`}
                      />
                      Total bobot harus tepat 100% sebelum finalisasi.
                    </li>
                    <li className="flex gap-2">
                      <LockKeyhole
                        size={14}
                        className={`mt-0.5 shrink-0 ${themePrimaryText}`}
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

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-komponen-title"
        >
          <div className="theme-card w-full max-w-md rounded-2xl border theme-border p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="create-komponen-title"
                  className="theme-text text-base font-bold"
                >
                  Tambah Komponen Nilai
                </h2>
                <p className="theme-text-secondary mt-1 text-xs">
                  {subjectLabel} · Sisa bobot tersedia:{" "}
                  <span className="font-semibold text-[var(--color-primary)]">
                    {sisaBobot}%
                  </span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup dialog"
                disabled={creating}
                onClick={() => setShowCreateModal(false)}
                className="theme-text-muted rounded-lg p-1.5 hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateKomponen} className="mt-5 space-y-4">
              {createError && (
                <div
                  role="alert"
                  className={`flex items-start gap-2 rounded-lg border ${themeDangerBorder} ${themeDangerSurface} p-3 text-xs text-[var(--color-danger)]`}
                >
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="komponen-nama"
                  className="theme-text-secondary mb-1.5 block text-xs font-semibold"
                >
                  Nama Komponen <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  id="komponen-nama"
                  type="text"
                  required
                  value={formKomponen.nama}
                  onChange={(e) =>
                    setFormKomponen((prev) => ({
                      ...prev,
                      nama: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Tugas Harian 1 / UTS"
                  disabled={creating}
                  className={`${themeInput} w-full rounded-lg px-3 py-2.5 text-sm`}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="komponen-jenis"
                    className="theme-text-secondary mb-1.5 block text-xs font-semibold"
                  >
                    Jenis
                  </label>
                  <select
                    id="komponen-jenis"
                    value={formKomponen.jenis}
                    onChange={(e) =>
                      setFormKomponen((prev) => ({
                        ...prev,
                        jenis: e.target.value,
                      }))
                    }
                    disabled={creating}
                    className={`${themeInput} w-full rounded-lg px-3 py-2.5 text-sm`}
                  >
                    <option value="tugas">Tugas</option>
                    <option value="kuis">Kuis</option>
                    <option value="uts">UTS</option>
                    <option value="uas">UAS</option>
                    <option value="praktik">Praktik</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="komponen-kelompok"
                    className="theme-text-secondary mb-1.5 block text-xs font-semibold"
                  >
                    Kelompok
                  </label>
                  <select
                    id="komponen-kelompok"
                    value={formKomponen.kelompok}
                    onChange={(e) =>
                      setFormKomponen((prev) => ({
                        ...prev,
                        kelompok: e.target.value,
                      }))
                    }
                    disabled={creating}
                    className={`${themeInput} w-full rounded-lg px-3 py-2.5 text-sm`}
                  >
                    <option value="umum">Umum</option>
                    <option value="pengetahuan">Pengetahuan</option>
                    <option value="keterampilan">Keterampilan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="komponen-bobot"
                    className="theme-text-secondary mb-1.5 block text-xs font-semibold"
                  >
                    Bobot (%) <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <input
                    id="komponen-bobot"
                    type="number"
                    min={0.01}
                    max={sisaBobot}
                    step="0.01"
                    required
                    value={formKomponen.bobot}
                    onChange={(e) =>
                      setFormKomponen((prev) => ({
                        ...prev,
                        bobot: e.target.value,
                      }))
                    }
                    disabled={creating}
                    className={`${themeInput} w-full rounded-lg px-3 py-2.5 text-sm`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="komponen-maks"
                    className="theme-text-secondary mb-1.5 block text-xs font-semibold"
                  >
                    Nilai Maksimum
                  </label>
                  <input
                    id="komponen-maks"
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formKomponen.nilaiMaksimum}
                    onChange={(e) =>
                      setFormKomponen((prev) => ({
                        ...prev,
                        nilaiMaksimum: e.target.value,
                      }))
                    }
                    disabled={creating}
                    className={`${themeInput} w-full rounded-lg px-3 py-2.5 text-sm`}
                  />
                </div>
              </div>

              <div className={`flex flex-col-reverse gap-2 border-t ${themeDivider} pt-4 sm:flex-row sm:justify-end`}>
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreateModal(false)}
                  className={`inline-flex items-center justify-center rounded-lg border ${themeNeutralBorder} px-4 py-2.5 text-xs font-semibold theme-text-secondary`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {creating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  {creating ? "Menyimpan..." : "Simpan Komponen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}