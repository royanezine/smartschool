"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  BookOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  ListChecks,
  X,
  Copy,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  GraduationCap,
  CalendarDays,
  Timer,
  Award,
  Sparkles,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getUjianById, getHasilUjian } from "@/services/ujian.service";
import { deleteSoal } from "@/services/soalUjian.service";

const JENIS_SOAL = {
  pilihan_ganda: { label: "Pilihan Ganda", color: "var(--color-primary)", bg: "color-mix(in srgb, var(--color-primary) 10%, transparent)" },
  esai: { label: "Esai", color: "var(--color-primary)", bg: "color-mix(in srgb, var(--color-primary) 10%, transparent)" },
  benar_salah: { label: "Benar / Salah", color: "var(--color-primary)", bg: "color-mix(in srgb, var(--color-primary) 10%, transparent)" },
};

function parseObject(response) {
  if (response?.data?.data) return response.data.data;
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
}

function formatPoin(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? number : number.toFixed(2);
}

function getJenisLabel(jenis) {
  return JENIS_SOAL[jenis]?.label || jenis || "-";
}

function getJenisStyle(jenis) {
  return JENIS_SOAL[jenis] || { color: "var(--color-text-secondary)", bg: "var(--color-input)" };
}

function getChoiceLetter(index) {
  return String.fromCharCode(65 + index);
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPilihan(item) {
  if (Array.isArray(item?.pilihan)) return item.pilihan;
  if (typeof item?.pilihan === "string") {
    try {
      const parsed = JSON.parse(item.pilihan);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text"
      >
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      {Icon && (
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: "color-mix(in srgb, var(--school-primary) 10%, transparent)",
            color: "var(--school-primary)",
          }}
        >
          <Icon size={15} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-[var(--color-text)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: "color-mix(in srgb, var(--school-primary) 10%, transparent)",
          color: "var(--school-primary)",
        }}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-[var(--color-text)] sm:text-lg">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-secondary)] sm:text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function KelolaSoalUjianPage() {
  const router = useRouter();
  const params = useParams();
  const ujianId = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ujian, setUjian] = useState(null);
  const [soal, setSoal] = useState([]);
  const [hasilPeserta, setHasilPeserta] = useState([]);
  const [hasilInfo, setHasilInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(true);

  const loadData = useCallback(async () => {
    if (!ujianId) return;
    try {
      setLoading(true);
      setError("");
      setHasilInfo("");
      const [detailResult, hasilResult] = await Promise.allSettled([
        getUjianById(ujianId),
        getHasilUjian(ujianId, { page: 1, limit: 50 }),
      ]);

      if (detailResult.status !== "fulfilled") {
        throw detailResult.reason;
      }

      const ujianData = parseObject(detailResult.value);
      if (!ujianData || !ujianData.id) {
        throw new Error("Data ujian tidak ditemukan.");
      }
      setUjian(ujianData);
      const soalData = Array.isArray(ujianData.soalAsesmen) ? ujianData.soalAsesmen : [];
      const sortedSoal = [...soalData].sort(
        (a, b) => Number(a.nomorUrut || 0) - Number(b.nomorUrut || 0)
      );
      setSoal(sortedSoal);

      if (hasilResult.status === "fulfilled") {
        setHasilPeserta(Array.isArray(hasilResult.value?.data) ? hasilResult.value.data : []);
      } else {
        setHasilPeserta([]);
        const reasonMsg = hasilResult.reason?.message || "";
        if (reasonMsg) {
          setHasilInfo(reasonMsg);
        }
      }
    } catch (err) {
      console.error("LOAD DETAIL UJIAN ERROR:", err);
      setError(err?.message || "Gagal mengambil data detail ujian.");
      setUjian(null);
      setSoal([]);
    } finally {
      setLoading(false);
    }
  }, [ujianId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadData();
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const stats = useMemo(() => {
    const total = soal.length;
    const pilihanGanda = soal.filter((i) => i.jenisSoal === "pilihan_ganda").length;
    const esai = soal.filter((i) => i.jenisSoal === "esai").length;
    const benarSalah = soal.filter((i) => i.jenisSoal === "benar_salah").length;
    const totalPoin = soal.reduce((s, i) => s + Number(i.poin || 0), 0);
    return { total, pilihanGanda, esai, benarSalah, totalPoin };
  }, [soal]);

  function handleOpenCreate() {
    if (!ujianId) return;
    router.push(`/guru/ujian/${ujianId}/soal`);
  }

  function handleOpenEdit(item) {
    if (!ujianId || !item?.id) return;
    router.push(`/guru/ujian/${ujianId}/soal?soalId=${item.id}`);
  }

  async function handleCopyToken() {
    if (!ujian?.token) {
      setError("Token ujian tidak tersedia.");
      return;
    }
    try {
      await navigator.clipboard.writeText(ujian.token);
      setCopied(true);
      setSuccess("Token ujian berhasil disalin ke clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("COPY TOKEN ERROR:", err);
      setError("Gagal menyalin token. Silakan salin secara manual.");
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus soal nomor ${item.nomorUrut}?\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;
    try {
      setDeleting(item.id);
      setError("");
      setSuccess("");
      await deleteSoal(item.id);
      setSuccess(`Soal nomor ${item.nomorUrut} berhasil dihapus.`);
      await loadData();
    } catch (err) {
      console.error("DELETE SOAL ERROR:", err);
      setError(err?.message || "Gagal menghapus soal.");
    } finally {
      setDeleting(null);
    }
  }

  function renderLayout(content) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
        <Sidebar
          active="ujian"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="guru"
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() => setIsCollapsed((p) => !p)}
              notifications={[]}
              user={{
                name: "Guru",
                email: "guru@smartschool.com",
                avatar: "GR",
              }}
            />
          </div>
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--color-page)]">
            {content}
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return renderLayout(
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="text-center">
          <Loader2 size={34} className="mx-auto animate-spin text-[var(--school-primary)]" />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Memuat detail ujian...
          </p>
        </div>
      </div>
    );
  }

  return renderLayout(
    <div className="w-full space-y-4 p-4 sm:space-y-5 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/guru/ujian")}
            aria-label="Kembali ke daftar ujian"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--school-primary), var(--school-secondary))",
            }}
          >
            <ClipboardList size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[var(--color-text)] sm:text-xl">
              Detail Ujian
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] sm:text-sm">
              Informasi ujian dan pengelolaan soal.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)] focus:ring-offset-2 sm:w-auto"
          style={{ backgroundColor: "var(--school-primary)" }}
        >
          <Plus size={17} />
          Tambah Soal
        </button>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: "color-mix(in srgb, #DC2626 8%, var(--color-card))",
            borderColor: "color-mix(in srgb, #DC2626 25%, var(--color-border))",
            color: "#DC2626",
          }}
          role="alert"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Terjadi masalah</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Tutup pesan error"
            className="shrink-0 opacity-70 transition hover:opacity-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: "color-mix(in srgb, #16A34A 8%, var(--color-card))",
            borderColor: "color-mix(in srgb, #16A34A 25%, var(--color-border))",
            color: "#16A34A",
          }}
          role="status"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Berhasil</p>
            <p className="mt-1">{success}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Tutup pesan sukses"
            className="shrink-0 opacity-70 transition hover:opacity-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {!ujian ? (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-16 text-center">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <h2 className="mt-3 font-bold">Data ujian tidak ditemukan</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Periksa kembali data ujian yang ingin dibuka.
          </p>
          <button
            type="button"
            onClick={() => router.push("/guru/ujian")}
            className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "var(--school-primary)" }}
          >
            Kembali ke Daftar Ujian
          </button>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[var(--color-text)] sm:text-lg">
                  {ujian.judul || "Tanpa Judul"}
                </h2>
                {ujian.dipublikasikan ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: "rgba(22, 163, 74, 0.10)", color: "#16A34A" }}
                  >
                    <CheckCircle2 size={12} />
                    Dipublikasi
                  </span>
                ) : (
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.10)", color: "#D97706" }}
                  >
                    Draft
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={15} style={{ color: "var(--school-primary)" }} />
                  {ujian.kelasMapel?.kelas?.nama || "Kelas"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={15} style={{ color: "var(--school-secondary)" }} />
                  {ujian.kelasMapel?.mataPelajaran?.nama || "Mata Pelajaran"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={15} />
                  {ujian.durasi || 0} menit
                </span>
              </div>

              {ujian.deskripsi && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                  {ujian.deskripsi}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                    color: "var(--school-primary)",
                  }}
                >
                  <KeyRound size={16} />
                </span>
                <h2 className="text-sm font-bold text-[var(--color-text)]">Token Ujian</h2>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2.5">
                <span className="break-all font-mono text-base font-bold tracking-[0.15em] text-[var(--color-text)]">
                  {ujian.token ? (showToken ? ujian.token : "••••••") : "Tidak tersedia"}
                </span>
                {ujian.token && (
                  <button
                    type="button"
                    onClick={() => setShowToken((p) => !p)}
                    aria-label={showToken ? "Sembunyikan token" : "Tampilkan token"}
                    className="shrink-0 rounded-md p-1 text-[var(--color-text-secondary)] transition hover:text-[var(--school-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyToken}
                disabled={!ujian.token}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--school-primary)" }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Tersalin" : "Salin Token"}
              </button>

              <p className="mt-2 text-[11px] leading-4 text-[var(--color-text-secondary)]">
                Bagikan token hanya kepada siswa yang mengikuti ujian.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-4">
            <StatCard
              label="Total Soal"
              value={stats.total}
              icon={ListChecks}
            />
            <StatCard
              label="Pilihan Ganda"
              value={stats.pilihanGanda}
              icon={CheckCircle2}
            />
            <StatCard label="Esai" value={stats.esai} icon={FileText} />
            <StatCard
              label="Total Poin"
              value={formatPoin(stats.totalPoin)}
              icon={ClipboardList}
            />
          </div>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm sm:p-5">
            <SectionHeader
              icon={CalendarDays}
              title="Informasi Pelaksanaan"
              description="Detail teknis pelaksanaan ujian."
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              <InfoItem icon={GraduationCap} label="Jenis Ujian" value={ujian.tipe || "-"} />
              <InfoItem icon={Timer} label="Durasi" value={`${ujian.durasi || 0} menit`} />
              <InfoItem
                icon={Award}
                label="Nilai Kelulusan"
                value={ujian.nilaiKelulusan ?? "-"}
              />
              <InfoItem
                icon={CalendarDays}
                label="Waktu Mulai"
                value={formatTanggal(ujian.waktuMulai)}
              />
              <InfoItem
                icon={CalendarDays}
                label="Waktu Selesai"
                value={formatTanggal(ujian.waktuSelesai)}
              />
              <InfoItem
                icon={Sparkles}
                label="Penilaian Otomatis"
                value={ujian.penilaianOtomatis ? "Ya" : "Tidak"}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text)]">Daftar Soal</h2>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                  Urutan soal mengikuti nomor yang ditentukan.
                </p>
              </div>
              <span
                className="w-fit rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                  color: "var(--school-primary)",
                }}
              >
                {soal.length} Soal
              </span>
            </div>

            {soal.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                    color: "var(--school-primary)",
                  }}
                >
                  <ClipboardList size={26} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-[var(--color-text)]">
                  Belum ada soal
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[var(--color-text-secondary)] sm:text-sm">
                  Tambahkan soal pertama untuk mulai menyusun ujian ini.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "var(--school-primary)" }}
                >
                  <Plus size={16} />
                  Tambah Soal
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {soal.map((item, index) => {
                  const pilihan = getPilihan(item);
                  const jenisStyle = getJenisStyle(item.jenisSoal);

                  return (
                    <div
                      key={item.id}
                      className="p-4 transition hover:bg-[var(--color-input)] sm:p-5"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                        <div className="flex shrink-0 items-center gap-2 lg:w-12 lg:flex-col lg:items-center">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                              color: "var(--school-primary)",
                            }}
                          >
                            {item.nomorUrut || index + 1}
                          </div>
                          <span className="text-xs font-medium text-[var(--color-text-secondary)] lg:hidden">
                            Nomor soal
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor: jenisStyle.bg,
                                color: jenisStyle.color,
                              }}
                            >
                              {getJenisLabel(item.jenisSoal)}
                            </span>
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--school-secondary) 10%, transparent)",
                                color: "var(--school-secondary)",
                              }}
                            >
                              {formatPoin(item.poin)} poin
                            </span>
                          </div>

                          <p className="mt-2.5 whitespace-pre-wrap text-sm font-medium leading-6 text-[var(--color-text)]">
                            {item.teksSoal}
                          </p>

                          {item.jenisSoal === "pilihan_ganda" && pilihan.length > 0 && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {pilihan.map((pilihanItem, pilihanIndex) => {
                                const kunci = String(item.kunciJawaban ?? "").trim();
                                const jawaban = String(pilihanItem ?? "").trim();
                                const isCorrect =
                                  kunci.toUpperCase() === jawaban.toUpperCase() ||
                                  kunci.toUpperCase() === getChoiceLetter(pilihanIndex);

                                return (
                                  <div
                                    key={`${item.id}-${pilihanIndex}`}
                                    className="flex items-start gap-2 rounded-xl border px-3 py-2 text-sm"
                                    style={{
                                      backgroundColor: isCorrect
                                        ? "rgba(22, 163, 74, 0.08)"
                                        : "var(--color-card)",
                                      borderColor: isCorrect
                                        ? "rgba(22, 163, 74, 0.25)"
                                        : "var(--color-border)",
                                      color: isCorrect
                                        ? "#16A34A"
                                        : "var(--color-text-secondary)",
                                    }}
                                  >
                                    <span
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                                      style={{
                                        backgroundColor: "var(--color-input)",
                                        color: "var(--color-text)",
                                      }}
                                    >
                                      {getChoiceLetter(pilihanIndex)}
                                    </span>
                                    <span className="flex-1 pt-0.5">{pilihanItem}</span>
                                    {isCorrect && (
                                      <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {item.jenisSoal === "esai" && (
                            <div
                              className="mt-3 rounded-xl border px-3 py-2.5"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--color-primary) 8%, transparent)",
                                borderColor:
                                  "color-mix(in srgb, var(--color-primary) 20%, var(--color-border))",
                              }}
                            >
                              <p className="text-xs font-semibold theme-primary-text">
                                Soal Esai
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                                Jawaban akan diperiksa oleh guru.
                              </p>
                            </div>
                          )}

                          {item.jenisSoal === "benar_salah" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {["Benar", "Salah"].map((value) => {
                                const isCorrect =
                                  String(item.kunciJawaban || "")
                                    .trim()
                                    .toLowerCase() === value.toLowerCase();
                                return (
                                  <span
                                    key={value}
                                    className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                                    style={{
                                      backgroundColor: isCorrect
                                        ? "rgba(22, 163, 74, 0.08)"
                                        : "var(--color-card)",
                                      borderColor: isCorrect
                                        ? "rgba(22, 163, 74, 0.25)"
                                        : "var(--color-border)",
                                      color: isCorrect
                                        ? "#16A34A"
                                        : "var(--color-text-secondary)",
                                    }}
                                  >
                                    {value}
                                    {isCorrect && " ✓"}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2 lg:ml-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit soal"
                            aria-label={`Edit soal nomor ${item.nomorUrut}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--school-primary)]"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                              color: "var(--school-primary)",
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deleting === item.id}
                            title="Hapus soal"
                            aria-label={`Hapus soal nomor ${item.nomorUrut}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{
                              backgroundColor: "rgba(220, 38, 38, 0.08)",
                              color: "#DC2626",
                            }}
                          >
                            {deleting === item.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text)]">
                  Hasil & Sesi Peserta
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                  Daftar percobaan dan nilai siswa yang mengikuti ujian ini.
                </p>
              </div>
              <span
                className="w-fit rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                  color: "var(--school-primary)",
                }}
              >
                {hasilPeserta.length} Peserta
              </span>
            </div>

            {hasilInfo ? (
              <div className="px-5 py-6 text-xs text-[var(--color-text-secondary)]">
                {hasilInfo}
              </div>
            ) : hasilPeserta.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-[var(--color-text-secondary)]">
                Belum ada siswa yang mengumpulkan atau memulai ujian ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-input)] text-[11px] uppercase tracking-wider text-[var(--color-text-secondary)]">
                    <tr>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">NIS / NISN</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Benar / Salah</th>
                      <th className="px-4 py-3">Nilai</th>
                      <th className="px-4 py-3 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {hasilPeserta.map((item) => {
                      const nilaiAkhir =
                        item?.hasilAsesmen?.totalNilai ?? item?.nilai ?? "-";
                      return (
                        <tr key={item.id} className="hover:bg-[var(--color-input)]">
                          <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                            {item?.pengguna?.namaLengkap || "-"}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                            {item?.pengguna?.nisn || item?.pengguna?.nis || "-"}
                          </td>
                          <td className="px-4 py-3 capitalize text-[var(--color-text-secondary)]">
                            {item?.status || "-"}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                            {item?.hasilAsesmen
                              ? `${item.hasilAsesmen.jumlahBenar ?? 0} / ${item.hasilAsesmen.jumlahSalah ?? 0}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 font-bold text-[var(--school-primary)]">
                            {nilaiAkhir !== null && nilaiAkhir !== undefined
                              ? nilaiAkhir
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/guru/nilaiUjian/detail?ujianId=${encodeURIComponent(
                                    ujianId
                                  )}&siswaId=${encodeURIComponent(item.siswaId || "")}`
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--school-primary)] hover:text-[var(--school-primary)]"
                            >
                              <Eye size={13} />
                              Lihat
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-2.5 text-xs text-[var(--color-text-secondary)]">
            <HelpCircle size={14} />
            <span>Butuh bantuan? Hubungi admin sekolah jika ada kendala teknis.</span>
          </div>
        </>
      )}
    </div>
  );
}