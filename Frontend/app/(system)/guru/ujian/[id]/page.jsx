"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import { getUjianById } from "../../../../../services/ujian.service";

import {
  getSoalByUjian,
  deleteSoal,
} from "../../../../../services/soalUjian.service";

/* =====================================================
   HELPER
===================================================== */

function parseData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function parseObject(response) {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

function formatPoin(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? number : number.toFixed(2);
}

function getJenisLabel(jenis) {
  if (jenis === "pilihan_ganda") return "Pilihan Ganda";
  if (jenis === "esai") return "Esai";
  if (jenis === "benar_salah") return "Benar / Salah";
  return jenis || "-";
}

function getChoiceLetter(index) {
  return String.fromCharCode(65 + index);
}

/* =====================================================
   PAGE
===================================================== */

export default function KelolaSoalUjianPage() {
  const router = useRouter();
  const params = useParams();

  const ujianId = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ujian, setUjian] = useState(null);
  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    if (!ujianId) return;

    loadData();
  }, [ujianId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [ujianResponse, soalResponse] = await Promise.all([
        getUjianById(ujianId),
        getSoalByUjian(ujianId),
      ]);

      setUjian(parseObject(ujianResponse));

      const soalData = parseData(soalResponse);

      const sortedSoal = [...soalData].sort(
        (a, b) =>
          Number(a.nomorUrut || 0) -
          Number(b.nomorUrut || 0)
      );

      setSoal(sortedSoal);
    } catch (err) {
      console.error("LOAD SOAL ERROR:", err);

      setError(
        err?.message ||
          "Gagal mengambil data ujian dan soal."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(() => {
    const total = soal.length;

    const pilihanGanda = soal.filter(
      (item) =>
        item.jenisSoal === "pilihan_ganda"
    ).length;

    const esai = soal.filter(
      (item) =>
        item.jenisSoal === "esai"
    ).length;

    const benarSalah = soal.filter(
      (item) =>
        item.jenisSoal === "benar_salah"
    ).length;

    const totalPoin = soal.reduce(
      (sum, item) =>
        sum + Number(item.poin || 0),
      0
    );

    return {
      total,
      pilihanGanda,
      esai,
      benarSalah,
      totalPoin,
    };
  }, [soal]);

  /* =====================================================
     NAVIGASI
  ===================================================== */

  function handleOpenCreate() {
    if (!ujianId) return;

    router.push(
      `/guru/ujian/${ujianId}/soal`
    );
  }

  function handleOpenEdit(item) {
    if (!ujianId || !item?.id) return;

    router.push(
      `/guru/ujian/${ujianId}/soal?soalId=${item.id}`
    );
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus soal nomor ${item.nomorUrut}?`
    );

    if (!confirmed) return;

    try {
      setDeleting(item.id);
      setError("");
      setSuccess("");

      await deleteSoal(item.id);

      setSuccess(
        "Soal berhasil dihapus."
      );

      await loadData();
    } catch (err) {
      console.error(
        "DELETE SOAL ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus soal."
      );
    } finally {
      setDeleting(null);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
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
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GR",
            }}
          />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-[var(--school-primary)]"
              />

              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                Memuat data ujian...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

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
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        <main className="flex-1 overflow-y-auto bg-[var(--color-page)]">
          <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-start gap-3">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/guru/ujian")
                  }
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-input)] hover:text-[var(--color-text)]"
                >
                  <ArrowLeft size={18} />
                </button>

                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--school-primary), var(--school-secondary))",
                  }}
                >
                  <ClipboardList size={22} />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                    Kelola Soal
                  </h1>

                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Kelola pertanyaan dan jawaban untuk ujian ini.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{
                  backgroundColor:
                    "var(--school-primary)",
                }}
              >
                <Plus size={17} />
                Tambah Soal
              </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, #DC2626 8%, var(--color-card))",
                  borderColor:
                    "color-mix(in srgb, #DC2626 25%, var(--color-border))",
                  color: "#DC2626",
                }}
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div className="min-w-0">
                  <p className="font-semibold">
                    Terjadi masalah
                  </p>

                  <p className="mt-1 break-words">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="ml-auto shrink-0 opacity-70 transition hover:opacity-100"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, #16A34A 8%, var(--color-card))",
                  borderColor:
                    "color-mix(in srgb, #16A34A 25%, var(--color-border))",
                  color: "#16A34A",
                }}
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <p className="font-semibold">
                    Berhasil
                  </p>

                  <p className="mt-1">
                    {success}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSuccess("")
                  }
                  className="ml-auto opacity-70 transition hover:opacity-100"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* =================================================
                UJIAN INFO
            ================================================= */}

            {ujian && (
              <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm sm:p-6">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-lg font-bold text-[var(--color-text)] sm:text-xl">
                        {ujian.judul}
                      </h2>

                      {ujian.dipublikasikan ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              "rgba(22, 163, 74, 0.10)",
                            color: "#16A34A",
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Dipublikasi
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor:
                              "rgba(245, 158, 11, 0.10)",
                            color: "#D97706",
                          }}
                        >
                          Draft
                        </span>
                      )}

                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-secondary)]">

                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen
                          size={15}
                          style={{
                            color:
                              "var(--school-primary)",
                          }}
                        />

                        {ujian.kelasMapel?.kelas?.nama ||
                          "Kelas"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <FileText
                          size={15}
                          style={{
                            color:
                              "var(--school-secondary)",
                          }}
                        />

                        {ujian.kelasMapel?.mataPelajaran?.nama ||
                          "Mata Pelajaran"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3
                          size={15}
                          style={{
                            color:
                              "var(--color-text-secondary)",
                          }}
                        />

                        {ujian.durasi || 0} menit
                      </span>

                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  <ListChecks
                    size={15}
                    style={{
                      color:
                        "var(--school-primary)",
                    }}
                  />
                  Total Soal
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  <CheckCircle2
                    size={15}
                    style={{
                      color:
                        "#16A34A",
                    }}
                  />
                  Pilihan Ganda
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {stats.pilihanGanda}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  <FileText
                    size={15}
                    style={{
                      color:
                        "var(--school-secondary)",
                    }}
                  />
                  Esai
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {stats.esai}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
                  <ClipboardList
                    size={15}
                    style={{
                      color:
                        "var(--school-accent)",
                    }}
                  />
                  Total Poin
                </div>

                <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                  {formatPoin(stats.totalPoin)}
                </p>
              </div>

            </div>

            {/* =================================================
                SOAL LIST
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">

              <div className="border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--color-text)]">
                    Daftar Soal
                  </h2>

                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                    Urutan soal mengikuti nomor yang ditentukan.
                  </p>
                </div>
              </div>

              {soal.length === 0 ? (
                <div className="px-5 py-16 text-center sm:px-6">

                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                      color:
                        "var(--school-primary)",
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
                    style={{
                      backgroundColor:
                        "var(--school-primary)",
                    }}
                  >
                    <Plus size={16} />
                    Tambah Soal
                  </button>

                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">

                  {soal.map((item, index) => (

                    <div
                      key={item.id}
                      className="p-5 transition hover:bg-[var(--color-input)] sm:p-6"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

                        {/* NOMOR */}

                        <div className="flex shrink-0 items-center gap-3 lg:w-16 lg:flex-col lg:items-center">

                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                              color:
                                "var(--school-primary)",
                            }}
                          >
                            {item.nomorUrut ||
                              index + 1}
                          </div>

                          <span className="text-xs font-medium text-[var(--color-text-secondary)] lg:hidden">
                            Nomor soal
                          </span>

                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor:
                                  "var(--color-input)",
                                color:
                                  "var(--color-text-secondary)",
                              }}
                            >
                              {getJenisLabel(
                                item.jenisSoal
                              )}
                            </span>

                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--school-secondary) 10%, transparent)",
                                color:
                                  "var(--school-secondary)",
                              }}
                            >
                              {formatPoin(item.poin)} poin
                            </span>

                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-[var(--color-text)]">
                            {item.teksSoal}
                          </p>

                          {/* PILIHAN GANDA */}

                          {item.jenisSoal ===
                            "pilihan_ganda" &&
                            Array.isArray(
                              item.pilihan
                            ) && (

                              <div className="mt-4 grid gap-2 sm:grid-cols-2">

                                {item.pilihan.map(
                                  (
                                    pilihan,
                                    pilihanIndex
                                  ) => {

                                    const isCorrect =
                                      String(
                                        item.jawabanBenar ??
                                          ""
                                      ).trim() ===
                                      String(
                                        pilihan ??
                                          ""
                                      ).trim();

                                    return (
                                      <div
                                        key={`${item.id}-${pilihanIndex}`}
                                        className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
                                        style={{
                                          backgroundColor:
                                            isCorrect
                                              ? "rgba(22, 163, 74, 0.08)"
                                              : "var(--color-card)",
                                          borderColor:
                                            isCorrect
                                              ? "rgba(22, 163, 74, 0.25)"
                                              : "var(--color-border)",
                                          color:
                                            isCorrect
                                              ? "#16A34A"
                                              : "var(--color-text-secondary)",
                                        }}
                                      >

                                        <span
                                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                                          style={{
                                            backgroundColor:
                                              "var(--color-input)",
                                            color:
                                              "var(--color-text)",
                                          }}
                                        >
                                          {getChoiceLetter(
                                            pilihanIndex
                                          )}
                                        </span>

                                        <span className="pt-0.5">
                                          {pilihan}
                                        </span>

                                        {isCorrect && (
                                          <CheckCircle2
                                            size={16}
                                            className="ml-auto mt-0.5 shrink-0"
                                          />
                                        )}

                                      </div>
                                    );
                                  }
                                )}

                              </div>
                            )}

                          {/* ESAI */}

                          {item.jenisSoal ===
                            "esai" && (

                            <div
                              className="mt-4 rounded-xl border px-4 py-3"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--school-secondary) 8%, transparent)",
                                borderColor:
                                  "color-mix(in srgb, var(--school-secondary) 20%, var(--color-border))",
                              }}
                            >
                              <p
                                className="text-xs font-semibold"
                                style={{
                                  color:
                                    "var(--school-secondary)",
                                }}
                              >
                                Soal Esai
                              </p>

                              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                Jawaban akan diperiksa oleh guru.
                              </p>
                            </div>
                          )}

                        </div>

                        {/* ACTION */}

                        <div className="flex shrink-0 items-center gap-2 lg:ml-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(item)
                            }
                            title="Edit soal"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--school-primary) 10%, transparent)",
                              color:
                                "var(--school-primary)",
                            }}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item)
                            }
                            disabled={
                              deleting ===
                              item.id
                            }
                            title="Hapus soal"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              backgroundColor:
                                "rgba(220, 38, 38, 0.08)",
                              color:
                                "#DC2626",
                            }}
                          >
                            {deleting ===
                            item.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>

                        </div>

                      </div>
                    </div>
                  ))}

                </div>
              )}

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}