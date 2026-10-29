"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  Users,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Sparkles,
  Edit,
  Send,
  Undo2,
  Plus,
  ChevronDown,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getKelasWali,
  getRapotKelas,
  generateRapotKelas,
  isiCatatanRapot,
  setPublishRapot,
} from "@/services/raport.service";


const JENIS_RAPOT_OPTIONS = [
  { value: "tengah_semester", label: "Tengah Semester" },
  { value: "akhir_semester", label: "Akhir Semester" },
];


function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

function formatNumber(value, digits = 2) {
  const number = Number(value);
  if (Number.isNaN(number)) return "-";
  return number.toFixed(digits);
}

function isPublished(status) {
  return String(status || "").trim().toLowerCase() === "published";
}

function tahunAjaranLabel(item) {
  return (
    item?.tahunAjaran ||
    item?.nama ||
    item?.tahun ||
    item?.id ||
    "-"
  );
}

function jenisRapotLabel(value) {
  const found = JENIS_RAPOT_OPTIONS.find((option) => option.value === value);
  return found?.label || value || "-";
}

function unwrapSemester(kelas) {
  return kelas?.tahunAjaran?.semester || kelas?.semester || "-";
}


export default function GuruRaporPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kelasWaliList, setKelasWaliList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [jenisRapot, setJenisRapot] = useState("akhir_semester");
  const [rapotList, setRapotList] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingRapot, setLoadingRapot] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState("");
  const [kelasError, setKelasError] = useState("");
  const [rapotError, setRapotError] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    jenisRapot: "akhir_semester",
    overwrite: false,
  });

  const [showCatatanModal, setShowCatatanModal] = useState(false);
  const [catatanTarget, setCatatanTarget] = useState(null);
  const [catatanForm, setCatatanForm] = useState({
    catatanWaliKelas: "",
    keterangan: "",
  });

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);


  const loadKelasWali = useCallback(async () => {
    try {
      setLoading(true);
      setKelasError("");

      const result = await getKelasWali();
      const list = unwrapList(result);

      setKelasWaliList(list);

      setSelectedKelasId((current) => {
        if (current && list.some((item) => String(item.id) === String(current))) {
          return current;
        }
        return list[0]?.id || "";
      });
    } catch (err) {
      console.error("Gagal memuat kelas wali:", err);
      setKelasError(
        err?.message ||
          "Gagal memuat daftar kelas yang dapat Anda kelola.",
      );
      setKelasWaliList([]);
      setSelectedKelasId("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadKelasWali();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadKelasWali]);


  const loadRapot = useCallback(
    async (overrides = {}) => {
      const kelasId = overrides.kelasId ?? selectedKelasId;
      const jenis = overrides.jenisRapot ?? jenisRapot;

      if (!kelasId) {
        setRapotList([]);
        return;
      }

      try {
        setLoadingRapot(true);
        setRapotError("");

        const result = await getRapotKelas(kelasId, { jenisRapot: jenis });
        setRapotList(unwrapList(result));
      } catch (err) {
        console.error("Gagal memuat rapot kelas:", err);
        setRapotError(err?.message || "Gagal memuat daftar rapot kelas.");
        setRapotList([]);
      } finally {
        setLoadingRapot(false);
      }
    },
    [selectedKelasId, jenisRapot],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRapot();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRapot]);


  useEffect(() => {
    if (!info) return undefined;
    const timer = setTimeout(() => setInfo(""), 4000);
    return () => clearTimeout(timer);
  }, [info]);


  const selectedKelas = useMemo(
    () =>
      kelasWaliList.find(
        (item) => String(item.id) === String(selectedKelasId),
      ) || null,
    [kelasWaliList, selectedKelasId],
  );

  const filteredRapot = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rapotList;

    return rapotList.filter((item) => {
      const nama = String(item?.pengguna?.namaLengkap || "").toLowerCase();
      const nis = String(item?.pengguna?.nis || "").toLowerCase();
      return nama.includes(keyword) || nis.includes(keyword);
    });
  }, [rapotList, search]);

  const stats = useMemo(() => {
    const published = rapotList.filter((item) => isPublished(item?.status));
    const nilaiValid = rapotList
      .map((item) => Number(item?.rataRata))
      .filter((value) => !Number.isNaN(value));

    const rataRata = nilaiValid.length
      ? nilaiValid.reduce((sum, value) => sum + value, 0) /
        nilaiValid.length
      : 0;

    return {
      total: rapotList.length,
      published: published.length,
      draft: rapotList.length - published.length,
      rataRata,
    };
  }, [rapotList]);


  const openGenerateModal = () => {
    setError("");
    setGenerateForm({ jenisRapot, overwrite: false });
    setShowGenerateModal(true);
  };

  const handleGenerate = async () => {
    if (!selectedKelasId) return;

    try {
      setSubmitting(true);
      setError("");

      const result = await generateRapotKelas(selectedKelasId, {
        jenisRapot: generateForm.jenisRapot,
        overwrite: generateForm.overwrite,
      });

      setInfo(
        `${result?.message || "Rapot berhasil digenerate."} (${
          result?.data?.jumlahRapot || 0
        } rapot)`,
      );

      setShowGenerateModal(false);
      setJenisRapot(generateForm.jenisRapot);
      await loadRapot({ jenisRapot: generateForm.jenisRapot });
    } catch (err) {
      console.error("Gagal generate rapot:", err);
      setError(err?.message || "Gagal generate rapot.");
    } finally {
      setSubmitting(false);
    }
  };


  const openCatatanModal = (item) => {
    setCatatanTarget(item);
    setCatatanForm({
      catatanWaliKelas: item?.catatanWaliKelas || "",
      keterangan: item?.keterangan || "",
    });
    setError("");
    setShowCatatanModal(true);
  };

  const handleCatatan = async () => {
    if (!catatanTarget) return;

    try {
      setSubmitting(true);
      setError("");

      const result = await isiCatatanRapot(catatanTarget.id, {
        catatanWaliKelas: catatanForm.catatanWaliKelas,
        keterangan: catatanForm.keterangan,
      });

      setInfo(result?.message || "Catatan rapot berhasil disimpan.");
      setShowCatatanModal(false);
      setCatatanTarget(null);
      await loadRapot();
    } catch (err) {
      console.error("Gagal menyimpan catatan:", err);
      setError(err?.message || "Gagal menyimpan catatan rapot.");
    } finally {
      setSubmitting(false);
    }
  };


  const handlePublishToggle = async (item) => {
    if (!item?.id) {
      setError("ID rapot tidak ditemukan.");
      return;
    }

    if (submittingId === item.id) {
      return;
    }

    const aksi = isPublished(item?.status) ? "unpublish" : "publish";

    try {
      setSubmittingId(item.id);
      setError("");

      const result = await setPublishRapot(item.id, aksi);

      if (result && result.success === false) {
        throw new Error(result.message || "Gagal mengubah status publish rapot.");
      }

      setInfo(result?.message || `Rapot berhasil di-${aksi}.`);

      await loadRapot();
    } catch (err) {
      console.error("Gagal mengubah status publish:", err);
      setError(err?.message || "Gagal mengubah status publish rapot.");
    } finally {
      setSubmittingId("");
    }
  };


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="guru"
        active="rapor"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{ name: "Guru", email: "guru@smartschool.com", avatar: "GR" }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="theme-card theme-border mb-6 overflow-hidden rounded-2xl border p-6 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <Award size={28} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      Wali Kelas
                    </p>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Rapor Kelas
                    </h1>
                    <p className="theme-text-secondary mt-1 text-sm">
                      Kelola rapot siswa pada kelas yang Anda walikan
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      loadKelasWali();
                      loadRapot();
                    }}
                    className="theme-border theme-card theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:text-[var(--color-primary)]"
                  >
                    <RefreshCw size={16} />
                    Muat Ulang
                  </button>

                  <button
                    type="button"
                    onClick={openGenerateModal}
                    disabled={!selectedKelasId}
                    className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Generate Rapot
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Terjadi masalah</p>
                  <p className="mt-0.5 text-xs opacity-80">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {info && (
              <div className="theme-success mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="font-medium">{info}</p>
              </div>
            )}

            <div className="theme-card theme-border mb-4 rounded-2xl border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:w-72">
                  <select
                    value={selectedKelasId}
                    onChange={(event) => setSelectedKelasId(event.target.value)}
                    disabled={kelasWaliList.length === 0}
                    className="theme-input w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasWaliList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama ||
                          item.namaKelas ||
                          `Kelas ${item.tingkat || ""}`}
                        {item?.tahunAjaran
                          ? ` · ${tahunAjaranLabel(item.tahunAjaran)}`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative w-full lg:w-52">
                  <select
                    value={jenisRapot}
                    onChange={(event) => setJenisRapot(event.target.value)}
                    className="theme-input w-full appearance-none rounded-xl px-4 py-2.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                  >
                    {JENIS_RAPOT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari nama siswa atau NIS..."
                    className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                  />
                </div>
              </div>

              {selectedKelas ? (
                <div className="mt-3 space-y-1.5">
                  <p className="theme-text-muted flex items-center gap-1.5 text-xs">
                    <Sparkles size={13} />
                    {selectedKelas._count?.anggota ?? 0} siswa ·{" "}
                    {selectedKelas._count?.rapot ?? 0} rapot · Semester{" "}
                    {unwrapSemester(selectedKelas)}
                  </p>
                  <p className="theme-text-muted text-xs">
                    Menampilkan{" "}
                    <span className="theme-text font-medium">
                      {jenisRapotLabel(jenisRapot)}
                    </span>
                    . Status draft/published berlaku per jenis rapor, jadi
                    periode yang berbeda dapat memiliki status berbeda.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<FileText size={22} />}
                label="Total Rapot"
                value={stats.total}
                color="primary"
              />
              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Dipublish"
                value={stats.published}
                color="success"
              />
              <StatCard
                icon={<Clock size={22} />}
                label="Draft"
                value={stats.draft}
                color="warning"
              />
              <StatCard
                icon={<Award size={22} />}
                label="Rata-rata"
                value={formatNumber(stats.rataRata)}
                color="info"
              />
            </div>

            <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="theme-card-soft border-b theme-border">
                      {[
                        "Rank",
                        "Siswa",
                        "Rata-rata",
                        "Hadir",
                        "Izin",
                        "Sakit",
                        "Alpha",
                        "Catatan",
                        "Status",
                        "Aksi",
                      ].map((heading, index) => (
                        <th
                          key={heading}
                          className={`theme-text-muted px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                            index === 9 ? "text-center" : "text-left"
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {loading || loadingRapot ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader2
                              size={18}
                              className="animate-spin text-[var(--color-primary)]"
                            />
                            Memuat data rapot...
                          </div>
                        </td>
                      </tr>
                    ) : kelasError ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={32} className="theme-danger" />
                            <p className="theme-text-secondary text-sm font-medium">
                              Gagal memuat daftar kelas
                            </p>
                            <p className="max-w-md text-xs">{kelasError}</p>
                            <button
                              type="button"
                              onClick={loadKelasWali}
                              className="theme-border theme-card theme-text-secondary mt-2 inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition hover:text-[var(--color-primary)]"
                            >
                              <RefreshCw size={14} />
                              Coba Lagi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : !selectedKelasId ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Users size={32} className="opacity-50" />
                            {kelasWaliList.length === 0 ? (
                              <>
                                <p className="theme-text-secondary text-sm font-medium">
                                  Tidak ada kelas yang dapat Anda kelola sebagai
                                  wali kelas
                                </p>
                                <p className="max-w-md text-xs">
                                  Halaman ini hanya menampilkan kelas yang Anda
                                  walikan. Mengajar sebuah mata pelajaran di
                                  suatu kelas belum tentu memberi akses
                                  pengelolaan rapor kelas tersebut.
                                </p>
                              </>
                            ) : (
                              <p className="theme-text-secondary text-sm font-medium">
                                Pilih kelas untuk melihat daftar rapot
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : rapotError ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={32} className="theme-danger" />
                            <p className="theme-text-secondary text-sm font-medium">
                              Gagal memuat daftar rapot
                            </p>
                            <p className="max-w-md text-xs">{rapotError}</p>
                            <button
                              type="button"
                              onClick={() => loadRapot()}
                              className="theme-border theme-card theme-text-secondary mt-2 inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition hover:text-[var(--color-primary)]"
                            >
                              <RefreshCw size={14} />
                              Coba Lagi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : filteredRapot.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="opacity-50" />
                            <p className="theme-text-secondary text-sm font-medium">
                              Belum ada rapot untuk periode ini
                            </p>
                            <p className="text-xs">
                              Gunakan tombol Generate Rapot untuk membuat rapot
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRapot.map((item) => {
                        const published = isPublished(item?.status);

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]"
                          >
                            <td className="theme-text px-4 py-3.5 font-semibold">
                              {item.ranking || "-"}
                            </td>

                            <td className="px-4 py-3.5">
                              <p className="theme-text font-medium">
                                {item.pengguna?.namaLengkap || "-"}
                              </p>
                              <p className="theme-text-muted text-xs">
                                {item.pengguna?.nis
                                  ? `NIS ${item.pengguna.nis}`
                                  : item.pengguna?.nisn || "-"}
                              </p>
                            </td>

                            <td className="theme-text px-4 py-3.5 font-bold">
                              {formatNumber(item.rataRata)}
                            </td>
                            <td className="theme-text-secondary px-4 py-3.5">
                              {item.jumlahHadir ?? 0}
                            </td>
                            <td className="theme-text-secondary px-4 py-3.5">
                              {item.jumlahIzin ?? 0}
                            </td>
                            <td className="theme-text-secondary px-4 py-3.5">
                              {item.jumlahSakit ?? 0}
                            </td>
                            <td className="theme-text-secondary px-4 py-3.5">
                              {item.jumlahAlpha ?? 0}
                            </td>

                            <td className="theme-text-secondary max-w-[220px] px-4 py-3.5">
                              <span className="line-clamp-2">
                                {item.catatanWaliKelas || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  published ? "theme-success" : "theme-warning"
                                }`}
                              >
                                {published ? (
                                  <CheckCircle2 size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {published ? "Published" : "Draft"}
                              </span>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-1">
                                <ActionButton
                                  title="Isi catatan"
                                  icon={<Edit size={16} />}
                                  onClick={() => openCatatanModal(item)}
                                  disabled={submittingId === item.id}
                                />
                                <ActionButton
                                  title={
                                    published ? "Unpublish" : "Publish"
                                  }
                                  icon={
                                    submittingId === item.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : published ? (
                                      <Undo2 size={16} />
                                    ) : (
                                      <Send size={16} />
                                    )
                                  }
                                  onClick={() => handlePublishToggle(item)}
                                  type={published ? "danger" : "primary"}
                                  disabled={submittingId === item.id}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="theme-border-soft theme-text-muted mt-8 border-t pt-6 text-center text-xs">
              © 2026 SmartSchool • Rapor Kelas
            </footer>
          </div>
        </main>
      </div>

      {showGenerateModal && (
        <Modal
          title="Generate Rapot"
          icon={<Plus size={20} />}
          onClose={() => setShowGenerateModal(false)}
          onSave={handleGenerate}
          saveLabel={submitting ? "Memproses..." : "Generate"}
          disabled={submitting}
        >
          <p className="theme-text-secondary text-sm">
            Rapot akan digenerate untuk seluruh siswa pada kelas{" "}
            <span className="theme-text font-semibold">
              {selectedKelas?.nama || selectedKelasId}
            </span>{" "}
            dengan status draft.
          </p>

          <FormSelect
            label="Jenis Rapot"
            value={generateForm.jenisRapot}
            onChange={(event) =>
              setGenerateForm((prev) => ({
                ...prev,
                jenisRapot: event.target.value,
              }))
            }
            options={JENIS_RAPOT_OPTIONS}
          />

          <label className="theme-text-secondary flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={generateForm.overwrite}
              onChange={(event) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  overwrite: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded"
            />
            Timpa rapot draft yang sudah ada
          </label>
        </Modal>
      )}

      {showCatatanModal && catatanTarget && (
        <Modal
          title="Catatan Wali Kelas"
          icon={<Edit size={20} />}
          onClose={() => setShowCatatanModal(false)}
          onSave={handleCatatan}
          saveLabel={submitting ? "Menyimpan..." : "Simpan"}
          disabled={submitting}
        >
          <div className="theme-card-soft rounded-xl px-4 py-3 text-sm">
            <p className="theme-text font-semibold">
              {catatanTarget.pengguna?.namaLengkap || "-"}
            </p>
            <p className="theme-text-muted mt-0.5 text-xs">
              {catatanTarget.pengguna?.nis
                ? `NIS ${catatanTarget.pengguna.nis}`
                : catatanTarget.pengguna?.nisn || "-"}
            </p>
          </div>

          <FormTextarea
            label="Catatan Wali Kelas"
            value={catatanForm.catatanWaliKelas}
            onChange={(event) =>
              setCatatanForm((prev) => ({
                ...prev,
                catatanWaliKelas: event.target.value,
              }))
            }
            placeholder="Tulis catatan untuk siswa..."
          />

          <FormTextarea
            label="Keterangan (opsional)"
            value={catatanForm.keterangan}
            onChange={(event) =>
              setCatatanForm((prev) => ({
                ...prev,
                keterangan: event.target.value,
              }))
            }
            placeholder="Keterangan tambahan"
          />
        </Modal>
      )}
    </div>
  );
}


function StatCard({ icon, label, value, color }) {
  const colors = {
    primary:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    info: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]",
    success: "theme-success",
    warning: "theme-warning",
    danger: "theme-danger",
  };

  return (
    <div className="theme-card theme-border rounded-2xl border p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color] || colors.primary}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-xs font-medium">{label}</p>
          <p className="theme-text mt-1 text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ title, icon, onClick, type = "primary", disabled = false }) {
  const styles =
    type === "danger"
      ? "hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] hover:text-[var(--color-danger)]"
      : "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`theme-text-muted rounded-lg p-1.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
    >
      {icon}
    </button>
  );
}

function Modal({
  title,
  icon,
  onClose,
  onSave,
  saveLabel = "Simpan",
  disabled = false,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="theme-card theme-border max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
        <div className="flex items-center justify-between border-b theme-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
              {icon}
            </div>
            <h2 className="theme-text text-lg font-bold">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-text-muted rounded-lg p-1.5 transition hover:text-[var(--color-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">{children}</div>

        <div className="flex justify-end gap-3 border-t theme-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="theme-card-soft theme-text-secondary rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold transition hover:brightness-95"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={disabled}
            className="theme-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled && <Loader2 size={16} className="animate-spin" />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSelect({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="theme-input w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      />
    </div>
  );
}
