
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getDetailTugas } from "@/services/tugas.service";
import { apiFetch } from "@/lib/api";

import {
  ArrowLeft,
  Search,
  Users,
  BookOpen,
  ClipboardList,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Loader2,
  GraduationCap,
} from "lucide-react";

// ======================================================
// THEME
// ======================================================

const primaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const primarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const primaryText = "text-[var(--color-primary)]";

const cardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const neutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const neutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const divider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

// ======================================================
// HELPERS
// ======================================================

function unwrapResponse(response) {
  let data = response;

  for (let i = 0; i < 4; i += 1) {
    if (!data || typeof data !== "object") break;

    if (
      data.data &&
      typeof data.data === "object"
    ) {
      data = data.data;
      continue;
    }

    break;
  }

  return data;
}

function getStudentName(item) {
  return (
    item?.pengguna?.namaLengkap ||
    item?.siswa?.namaLengkap ||
    item?.pengguna?.nama ||
    item?.namaLengkap ||
    "Nama siswa tidak tersedia"
  );
}

function getInitials(name) {
  if (!name || name === "Nama siswa tidak tersedia") {
    return "S";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSubmissionStatus(item) {
  const status = String(item?.status || "").toLowerCase();

  if (status === "dinilai") return "Sudah Dinilai";
  if (status === "terlambat") return "Terlambat";

  if (
    item?.nilai !== null &&
    item?.nilai !== undefined
  ) {
    return "Sudah Dinilai";
  }

  return "Menunggu Penilaian";
}

// ======================================================
// PAGE
// ======================================================

export default function NilaiTugasPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const tugasId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [tugas, setTugas] = useState(null);
  const [pengumpulan, setPengumpulan] = useState([]);
  const [nilaiForm, setNilaiForm] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifications = [];

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadData = useCallback(async () => {
    if (!tugasId) {
      setError("ID tugas tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getDetailTugas(tugasId);
      const data = unwrapResponse(response);

      if (!data?.id) {
        throw new Error("Data tugas tidak ditemukan.");
      }

      const submissions = Array.isArray(
        data.pengumpulanTugasSiswa
      )
        ? data.pengumpulanTugasSiswa
        : Array.isArray(data.pengumpulan)
          ? data.pengumpulan
          : Array.isArray(data.pengumpulanTugas)
            ? data.pengumpulanTugas
            : [];

      setTugas(data);
      setPengumpulan(submissions);

      const initialForm = {};

      submissions.forEach((item) => {
        initialForm[item.id] = {
          nilai:
            item.nilai !== null && item.nilai !== undefined
              ? String(item.nilai)
              : "",
          keterangan: item.keterangan || "",
        };
      });

      setNilaiForm(initialForm);
    } catch (err) {
      console.error("ERROR HALAMAN NILAI:", err);
      setError(
        err?.message || "Gagal memuat data penilaian."
      );
    } finally {
      setLoading(false);
    }
  }, [tugasId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ======================================================
  // DATA RINGKASAN
  // ======================================================

  const kelasMapel = tugas?.kelasMapel || {};

  const kelasNama =
    kelasMapel?.kelas?.nama ||
    kelasMapel?.kelas?.namaKelas ||
    "-";

  const mapelNama =
    kelasMapel?.mataPelajaran?.nama ||
    kelasMapel?.mapel?.nama ||
    "-";

  const guruNama =
    kelasMapel?.guruPengajar?.namaLengkap ||
    "-";

  const jumlahPengumpulan =
    typeof tugas?._count?.pengumpulanTugasSiswa === "number"
      ? tugas._count.pengumpulanTugasSiswa
      : pengumpulan.length;

  const jumlahDinilai = pengumpulan.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "dinilai" ||
      (item.nilai !== null && item.nilai !== undefined)
  ).length;

  const jumlahMenunggu = pengumpulan.length - jumlahDinilai;

  const filteredSubmissions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return pengumpulan.filter((item) => {
      const name = getStudentName(item).toLowerCase();
      const nisn = String(item?.pengguna?.nisn || "").toLowerCase();
      const status = getSubmissionStatus(item);

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        nisn.includes(keyword);

      const matchesFilter =
        filter === "semua" ||
        (filter === "dinilai" && status === "Sudah Dinilai") ||
        (filter === "menunggu" && status !== "Sudah Dinilai");

      return matchesSearch && matchesFilter;
    });
  }, [pengumpulan, search, filter]);

  // ======================================================
  // UPDATE FORM
  // ======================================================

  function updateField(id, field, value) {
    setNilaiForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));

    setSuccess("");
  }

  // ======================================================
  // SAVE GRADE
  // ======================================================

  async function handleSave(item) {
    const form = nilaiForm[item.id];

    if (
      !form ||
      form.nilai === "" ||
      !Number.isFinite(Number(form.nilai))
    ) {
      setError("Masukkan nilai berupa angka terlebih dahulu.");
      setSuccess("");
      return;
    }

    const nilai = Number(form.nilai);

    if (nilai < 0 || nilai > 100) {
      setError("Nilai harus berada di antara 0 sampai 100.");
      setSuccess("");
      return;
    }

    try {
      setSavingId(item.id);
      setError("");
      setSuccess("");

      // Sesuaikan URL ini dengan route backend yang sebenarnya.
      await apiFetch(
        `/api/tugas/pengumpulan/${item.id}/nilai`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nilai,
            keterangan: form.keterangan,
          }),
        }
      );

      setSuccess(
        `Nilai ${getStudentName(item)} berhasil disimpan.`
      );

      await loadData();
    } catch (err) {
      console.error("ERROR SIMPAN NILAI:", err);
      setError(
        err?.message || "Gagal menyimpan nilai. Silakan coba lagi."
      );
    } finally {
      setSavingId(null);
    }
  }

  // ======================================================
  // LAYOUT
  // ======================================================

  function renderLayout(content) {
    return (
      <div className="theme-page flex h-screen overflow-hidden">
        <Sidebar
          active="tugas"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen((prev) => !prev)
          }
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setSidebarOpen((prev) => !prev)
              }
              notifications={notifications}
              user={{
                name: guruNama !== "-" ? guruNama : "Guru",
                email: "guru@smartschool.com",
                avatar: getInitials(guruNama),
              }}
            />
          </div>

          {content}
        </div>
      </div>
    );
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return renderLayout(
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Loader2
            className={`mx-auto h-8 w-8 animate-spin ${primaryText}`}
          />
          <p className="theme-text-secondary mt-3 text-sm">
            Memuat data penilaian...
          </p>
        </div>
      </main>
    );
  }

  // ======================================================
  // ERROR TANPA DATA
  // ======================================================

  if (!tugas && error) {
    return renderLayout(
      <main className="flex flex-1 items-center justify-center p-5">
        <div className="theme-card w-full max-w-md rounded-2xl border p-6 text-center">
          <AlertCircle
            className="theme-danger mx-auto"
            size={30}
          />
          <h2 className="theme-text mt-3 font-semibold">
            Gagal Memuat Penilaian
          </h2>
          <p className="theme-text-secondary mt-2 text-sm">
            {error}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${primaryGradient}`}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </main>
    );
  }

  // ======================================================
  // MAIN CONTENT
  // ======================================================

  return renderLayout(
    <main className="theme-page min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* BACK */}
        <button
          type="button"
          onClick={() => router.push(`/guru/tugas/${tugasId}`)}
          className="theme-text-secondary mb-5 inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={16} />
          Kembali ke Detail Tugas
        </button>

        {/* PAGE TITLE */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${primarySoft} ${primaryText}`}
              >
                <GraduationCap size={21} />
              </div>

              <div>
                <h1 className="theme-text text-xl font-semibold sm:text-2xl">
                  Penilaian Tugas
                </h1>
                <p className="theme-text-secondary mt-1 text-sm">
                  Periksa pengumpulan dan berikan nilai kepada siswa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TASK INFORMATION */}
        <section
          className={`theme-card rounded-2xl border ${neutralBorder} ${cardShadow}`}
        >
          <div className="p-5 sm:p-6">
            <h2 className="theme-text break-words text-lg font-semibold">
              {tugas?.judul || "Tanpa judul"}
            </h2>

            <div className="theme-text-secondary mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <BookOpen size={15} />
                {mapelNama}
              </span>

              <span className="inline-flex items-center gap-2">
                <Users size={15} />
                {kelasNama}
              </span>

              <span className="inline-flex items-center gap-2">
                <Clock size={15} />
                Batas: {formatDate(tugas?.batasWaktu)}
              </span>
            </div>

            {guruNama !== "-" && (
              <p className="theme-text-secondary mt-3 text-xs">
                Guru pengajar: {guruNama}
              </p>
            )}
          </div>
        </section>

        {/* SUMMARY */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={<Users size={18} />}
            label="Siswa Mengumpulkan"
            value={jumlahPengumpulan}
          />

          <SummaryCard
            icon={<CheckCircle2 size={18} />}
            label="Sudah Dinilai"
            value={jumlahDinilai}
          />

          <SummaryCard
            icon={<Clock size={18} />}
            label="Menunggu Penilaian"
            value={jumlahMenunggu}
          />
        </div>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* STUDENT TABLE */}
        <section
          className={`theme-card mt-5 overflow-hidden rounded-2xl border ${neutralBorder} ${cardShadow}`}
        >
          <div
            className={`border-b ${divider} p-5 sm:p-6`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="theme-text text-base font-semibold">
                  Daftar Pengumpulan Siswa
                </h2>
                <p className="theme-text-secondary mt-1 text-xs">
                  Masukkan nilai dan catatan untuk setiap pengumpulan.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Cari nama atau NISN..."
                    className={`theme-input w-full rounded-lg border ${neutralBorder} bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)] sm:w-64`}
                  />
                </div>

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  className={`theme-input rounded-lg border ${neutralBorder} bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]`}
                >
                  <option value="semua">Semua Status</option>
                  <option value="menunggu">Menunggu Penilaian</option>
                  <option value="dinilai">Sudah Dinilai</option>
                </select>
              </div>
            </div>
          </div>

          {pengumpulan.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${neutralSurface}`}
              >
                <ClipboardList
                  size={24}
                  className="theme-text-muted"
                />
              </div>

              <h3 className="theme-text mt-4 text-sm font-semibold">
                Belum Ada Pengumpulan
              </h3>

              <p className="theme-text-secondary mx-auto mt-2 max-w-md text-sm leading-6">
                Belum ada data pengumpulan siswa pada respons detail tugas.
                Jika halaman daftar tugas menunjukkan siswa sudah mengumpulkan,
                pastikan endpoint detail menyertakan seluruh data pengumpulan.
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="theme-text-secondary px-5 py-10 text-center text-sm">
              Tidak ada siswa yang sesuai dengan pencarian atau filter.
            </div>
          ) : (
            <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              {filteredSubmissions.map((item) => {
                const nama = getStudentName(item);
                const status = getSubmissionStatus(item);
                const form = nilaiForm[item.id] || {
                  nilai: "",
                  keterangan: "",
                };

                const saving = savingId === item.id;

                return (
                  <article
                    key={item.id}
                    className="p-5 sm:p-6"
                  >
                    {/* STUDENT */}
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ${primarySoft} ${primaryText} text-sm font-semibold`}
                        >
                          {item?.pengguna?.avatar ? (
                            <img
                              src={item.pengguna.avatar}
                              alt={nama}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(nama)
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="theme-text break-words text-sm font-semibold">
                            {nama}
                          </h3>

                          <p className="theme-text-secondary mt-1 text-xs">
                            NISN: {item?.pengguna?.nisn || "-"}
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            Dikumpulkan: {formatDate(item.dibuatPada)}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                status === "Sudah Dinilai"
                                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                                  : status === "Terlambat"
                                    ? "border-red-500/20 bg-red-500/5 text-red-600"
                                    : `${neutralBorder} ${neutralSurface} theme-text-secondary`
                              }`}
                            >
                              {status}
                            </span>

                            {item.urlFile && (
                              <a
                                href={item.urlFile}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-1.5 rounded-lg border ${neutralBorder} px-3 py-1.5 text-xs font-medium theme-text-secondary transition hover:text-[var(--color-primary)]`}
                              >
                                <FileText size={14} />
                                Buka Jawaban
                              </a>
                            )}
                          </div>

                          {item.keterangan && (
                            <div
                              className={`mt-3 rounded-lg border ${neutralBorder} ${neutralSurface} p-3`}
                            >
                              <p className="theme-text-muted text-xs font-medium">
                                Catatan pengumpulan
                              </p>
                              <p className="theme-text-secondary mt-1 whitespace-pre-line break-words text-sm">
                                {item.keterangan}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* GRADE FORM */}
                      <div
                        className={`w-full rounded-xl border ${neutralBorder} ${neutralSurface} p-4 xl:max-w-md`}
                      >
                        <div className="mb-4 flex items-center gap-2">
                          <Award
                            size={17}
                            className={primaryText}
                          />
                          <h4 className="theme-text text-sm font-semibold">
                            Penilaian
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                          <div>
                            <label
                              htmlFor={`nilai-${item.id}`}
                              className="theme-text-secondary mb-1.5 block text-xs font-medium"
                            >
                              Nilai (0–100)
                            </label>

                            <input
                              id={`nilai-${item.id}`}
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              inputMode="numeric"
                              value={form.nilai}
                              onChange={(event) =>
                                updateField(
                                  item.id,
                                  "nilai",
                                  event.target.value
                                )
                              }
                              placeholder="0–100"
                              className={`theme-input w-full rounded-lg border ${neutralBorder} bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]`}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`catatan-${item.id}`}
                              className="theme-text-secondary mb-1.5 block text-xs font-medium"
                            >
                              Catatan guru
                            </label>

                            <input
                              id={`catatan-${item.id}`}
                              type="text"
                              value={form.keterangan}
                              onChange={(event) =>
                                updateField(
                                  item.id,
                                  "keterangan",
                                  event.target.value
                                )
                              }
                              placeholder="Catatan atau umpan balik..."
                              className={`theme-input w-full rounded-lg border ${neutralBorder} bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]`}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="theme-text-muted text-xs">
                            {form.nilai !== ""
                              ? `Nilai yang dimasukkan: ${form.nilai}`
                              : "Nilai belum dimasukkan"}
                          </p>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => handleSave(item)}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${primaryGradient} transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {saving ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Save size={16} />
                            )}

                            {saving ? "Menyimpan..." : "Simpan Nilai"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER NOTE */}
        <p className="theme-text-muted mt-4 text-xs leading-5">
          Pastikan nilai dan catatan sudah benar sebelum menyimpan.
          Nilai yang berhasil disimpan akan diperbarui dari data backend.
        </p>
      </div>
    </main>
  );
}

// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({ icon, label, value }) {
  return (
    <div
      className={`theme-card rounded-xl border ${neutralBorder} p-4 ${cardShadow}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${primarySoft} ${primaryText}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="theme-text-secondary text-xs">
            {label}
          </p>
          <p className="theme-text mt-1 text-xl font-semibold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
