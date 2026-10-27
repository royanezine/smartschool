
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  Plus,
  X,
  Save,
  ClipboardList,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  BookOpen,
  Info,
  ListChecks,
  Clock3,
  Target,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { getUjianById } from "@/services/ujian.service";

import {
  getSoalByUjian,
  createSoal,
  updateSoal,
} from "@/services/soalUjian.service";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


function parseData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.soal)) return response.soal;
  if (Array.isArray(response?.data?.soal)) return response.data.soal;

  return [];
}

function parseObject(response) {
  const value = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(value)) return value[0] ?? null;

  return value && typeof value === "object" ? value : null;
}

function getChoiceLetter(index) {
  return String.fromCharCode(65 + index);
}

const emptyForm = {
  teksSoal: "",
  jenisSoal: "pilihan_ganda",
  pilihan: ["", "", "", ""],
  jawabanBenar: "",
  poin: "10",
  nomorUrut: "1",
};


export default function FormSoalUjianPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const ujianId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const soalId = searchParams?.get("soalId") || "";
  const isEdit = Boolean(soalId);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ujian, setUjian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [totalSoal, setTotalSoal] = useState(0);


  useEffect(() => {
    if (!ujianId) {
      const timer = setTimeout(() => {
        setError("ID ujian tidak ditemukan.");
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [ujianResponse, soalResponse] = await Promise.all([
          getUjianById(String(ujianId)),
          getSoalByUjian(String(ujianId)),
        ]);

        if (!active) return;

        const ujianData = parseObject(ujianResponse);
        const soalData = parseData(soalResponse);

        setUjian(ujianData);
        setTotalSoal(soalData.length);

        if (isEdit) {
          const found = soalData.find(
            (item) => String(item.id) === String(soalId)
          );

          if (!found) {
            setError(
              "Soal tidak ditemukan. Pastikan endpoint GET soal berdasarkan ujian mengembalikan daftar soal yang benar."
            );
            return;
          }

          let pilihan = [];

          if (Array.isArray(found.pilihan)) {
            pilihan = found.pilihan.map((item) => String(item ?? ""));
          } else if (
            typeof found.pilihan === "string" &&
            found.pilihan.trim()
          ) {
            try {
              const parsed = JSON.parse(found.pilihan);

              pilihan = Array.isArray(parsed)
                ? parsed.map((item) => String(item ?? ""))
                : [];
            } catch {
              pilihan = [];
            }
          }

          if (found.jenisSoal === "pilihan_ganda") {
            while (pilihan.length < 2) pilihan.push("");
          } else {
            pilihan = ["", "", "", ""];
          }

          setForm({
            teksSoal: found.teksSoal ?? "",
            jenisSoal: found.jenisSoal ?? "pilihan_ganda",
            pilihan,
            jawabanBenar:
              found.jawabanBenar == null
                ? String(found.kunciJawaban ?? "")
                : String(found.jawabanBenar),
            poin: String(found.poin ?? 10),
            nomorUrut: String(found.nomorUrut ?? 1),
          });
        } else {
          setForm({
            ...emptyForm,
            pilihan: ["", "", "", ""],
            nomorUrut: String(soalData.length + 1),
          });
        }
      } catch (err) {
        if (!active) return;

        console.error("LOAD SOAL ERROR:", err);
        setError(err?.message || "Gagal mengambil data ujian dan soal.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [ujianId, soalId, isEdit]);


  function handleChange(event) {
    const { name, value } = event.target;

    setError("");
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleChoiceChange(index, value) {
    setError("");
    setSuccess("");

    setForm((prev) => {
      const pilihan = [...prev.pilihan];
      const oldValue = pilihan[index];

      pilihan[index] = value;

      return {
        ...prev,
        pilihan,
        jawabanBenar:
          prev.jawabanBenar === oldValue ? value : prev.jawabanBenar,
      };
    });
  }

  function addChoice() {
    if (form.pilihan.length >= 6) return;

    setForm((prev) => ({
      ...prev,
      pilihan: [...prev.pilihan, ""],
    }));
  }

  function removeChoice(index) {
    if (form.pilihan.length <= 2) return;

    setForm((prev) => {
      const removed = prev.pilihan[index];
      const pilihan = prev.pilihan.filter((_, i) => i !== index);

      return {
        ...prev,
        pilihan,
        jawabanBenar:
          prev.jawabanBenar === removed ? "" : prev.jawabanBenar,
      };
    });
  }

  function handleJenisChange(event) {
    const jenisSoal = event.target.value;

    setError("");
    setSuccess("");

    setForm((prev) => ({
      ...prev,
      jenisSoal,

      pilihan:
        jenisSoal === "pilihan_ganda"
          ? prev.pilihan.length >= 2
            ? prev.pilihan
            : ["", "", "", ""]
          : ["", "", "", ""],

      jawabanBenar:
        jenisSoal === "benar_salah"
          ? ""
          : jenisSoal === "pilihan_ganda"
            ? prev.jawabanBenar
            : "",
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!ujianId) {
      setError("ID ujian tidak ditemukan.");
      return;
    }

    const teksSoal = String(form.teksSoal ?? "").trim();

    if (teksSoal.length < 5) {
      setError("Teks soal wajib diisi minimal 5 karakter.");
      return;
    }

    const poinText = String(form.poin ?? "").trim();
    const poin = Number(poinText);

    if (
      poinText === "" ||
      !Number.isFinite(poin) ||
      poin <= 0
    ) {
      setError("Poin harus berupa angka lebih dari 0.");
      return;
    }

    const nomorUrutText = String(form.nomorUrut ?? "").trim();
    const nomorUrut = Number(nomorUrutText);

    if (
      nomorUrutText === "" ||
      !Number.isSafeInteger(nomorUrut) ||
      nomorUrut <= 0
    ) {
      setError(
        "Nomor urut harus berupa bilangan bulat positif, dimulai dari 1."
      );
      return;
    }

    let pilihan;
    let jawabanBenar;

    if (form.jenisSoal === "pilihan_ganda") {
      pilihan = form.pilihan
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);

      if (pilihan.length < 2) {
        setError("Pilihan ganda minimal memiliki 2 pilihan.");
        return;
      }

      if (pilihan.length > 6) {
        setError("Pilihan ganda maksimal memiliki 6 pilihan.");
        return;
      }

      const uniquePilihan = new Set(
        pilihan.map((item) => item.toLocaleLowerCase())
      );

      if (uniquePilihan.size !== pilihan.length) {
        setError("Setiap pilihan jawaban harus berbeda.");
        return;
      }

      jawabanBenar = String(form.jawabanBenar ?? "").trim();

      if (!jawabanBenar) {
        setError("Silakan pilih jawaban yang benar.");
        return;
      }

      if (!pilihan.includes(jawabanBenar)) {
        setError("Jawaban benar harus berasal dari pilihan yang tersedia.");
        return;
      }
    } else if (form.jenisSoal === "benar_salah") {
      pilihan = undefined;
      jawabanBenar = String(form.jawabanBenar ?? "").trim().toLowerCase();

      if (!["benar", "salah"].includes(jawabanBenar)) {
        setError("Pilih kunci jawaban Benar atau Salah.");
        return;
      }
    } else if (form.jenisSoal === "esai") {
      pilihan = undefined;
      jawabanBenar = undefined;
    } else {
      setError("Jenis soal tidak valid.");
      return;
    }

    const payload = {
  ujianId: String(ujianId),
  teksSoal,
  jenisSoal: form.jenisSoal,
  ...(form.jenisSoal === "pilihan_ganda" && {
    pilihan,
    jawabanBenar: String(jawabanBenar).trim(),
  }),
  ...(form.jenisSoal === "benar_salah" && {
    pilihan: ["benar", "salah"],
    jawabanBenar: String(jawabanBenar).trim().toLowerCase(),
  }),
  ...(form.jenisSoal === "esai" && {
    pilihan: [],
  }),
  poin: Number(poin),
  nomorUrut: Number(nomorUrut),
};

   try {
  setSaving(true);

  if (isEdit) {
    const { ujianId: _ujianId, ...updatePayload } = payload;

    await updateSoal(String(soalId), updatePayload);
  } else {
    await createSoal(payload);
  }

  router.push(`/guru/ujian/${ujianId}`);
} catch (err) {
  console.error("SAVE SOAL ERROR:", err);
  setError(err?.message || "Gagal menyimpan soal.");
} finally {
  setSaving(false);
}
  }

  function handleCancel() {
    if (ujianId) router.push(`/guru/ujian/${ujianId}`);
    else router.back();
  }


  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="ujian"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="guru"
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => setIsCollapsed((prev) => !prev)}
            notifications={[]}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GR",
            }}
          />

          <main className="theme-page flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className={`mx-auto animate-spin ${themePrimaryText}`}
              />
              <p className="theme-text-secondary mt-3 text-sm">
                Memuat data ujian...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="ujian"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="guru"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          notifications={[]}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GR",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
            <section
              className={`theme-card relative overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className={`absolute -right-24 -top-24 h-64 w-64 rounded-full ${themePrimarySoft} blur-3xl`}
                />
                <div
                  className={`absolute -bottom-28 left-1/3 h-56 w-56 rounded-full ${themeInfoSurface} blur-3xl`}
                />
              </div>

              <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`theme-card theme-text-secondary mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeSmallShadow} transition ${themeNeutralHover}`}
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                  >
                    <ClipboardList size={23} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        {isEdit ? "Edit Soal" : "Tambah Soal"}
                      </h1>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          isEdit
                            ? `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                            : `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                        }`}
                      >
                        {isEdit ? "Mode Edit" : "Soal Baru"}
                      </span>
                    </div>

                    <p className="theme-text-secondary mt-1.5 max-w-2xl text-sm leading-6">
                      {isEdit
                        ? "Perbarui pertanyaan dan konfigurasi jawaban soal."
                        : "Isi pertanyaan dan konfigurasi jawaban untuk soal baru pada ujian ini."}
                    </p>

                    {ujian && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-1.5 text-xs font-semibold ${themePrimaryText}`}
                        >
                          <BookOpen size={13} />
                          {ujian?.kelasMapel?.kelas?.nama || "Kelas"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} px-2.5 py-1.5 text-xs font-semibold text-[var(--color-info)]`}
                        >
                          <FileText size={13} />
                          {ujian?.kelasMapel?.mataPelajaran?.nama ||
                            "Mata Pelajaran"}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1.5 text-xs font-semibold theme-text-secondary`}
                        >
                          <Clock3 size={13} />
                          {ujian?.durasi || 0} menit
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`theme-card shrink-0 rounded-xl border ${themeNeutralBorder} px-3.5 py-2.5 ${themeSmallShadow}`}
                >
                  <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                    Total Soal
                  </p>
                  <p className="theme-text mt-0.5 text-lg font-bold">
                    {totalSoal} soal
                  </p>
                </div>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className={`flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} theme-danger px-4 py-3.5 text-sm`}
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
                  className="shrink-0 transition-opacity hover:opacity-70"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {success && (
              <div
                role="status"
                className={`flex items-start gap-3 rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} px-4 py-3.5 text-sm text-[var(--color-success)]`}
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Berhasil</p>
                  <p className="mt-1">{success}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)] 2xl:grid-cols-[minmax(0,1fr)_400px]">
              <form
                onSubmit={handleSubmit}
                className={`theme-card space-y-5 rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow} sm:p-6`}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="teksSoal"
                      className="theme-text flex items-center gap-2 text-sm font-semibold"
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <FileText size={13} />
                      </span>
                      Pertanyaan <span className="theme-danger">*</span>
                    </label>

                    <span className="theme-text-muted text-[11px] font-medium">
                      {form.teksSoal.length} karakter
                    </span>
                  </div>

                  <textarea
                    id="teksSoal"
                    name="teksSoal"
                    value={form.teksSoal}
                    onChange={handleChange}
                    rows={7}
                    required
                    disabled={saving}
                    placeholder="Tuliskan pertanyaan ujian..."
                    className={`theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)] disabled:opacity-60`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="jenisSoal"
                      className="theme-text mb-2 block text-sm font-semibold"
                    >
                      Jenis Soal
                    </label>

                    <select
                      id="jenisSoal"
                      name="jenisSoal"
                      value={form.jenisSoal}
                      onChange={handleJenisChange}
                      disabled={saving}
                      className={`theme-input w-full rounded-xl border px-3 py-3 text-sm font-medium outline-none transition ${themeFocus}`}
                    >
                      <option value="pilihan_ganda">Pilihan Ganda</option>
                      <option value="benar_salah">Benar / Salah</option>
                      <option value="esai">Esai</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="poin"
                      className="theme-text mb-2 block text-sm font-semibold"
                    >
                      Poin
                    </label>

                    <input
                      id="poin"
                      name="poin"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.poin}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className={`theme-input w-full rounded-xl border px-3 py-3 text-sm font-medium outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="nomorUrut"
                      className="theme-text mb-2 block text-sm font-semibold"
                    >
                      Nomor Urut
                    </label>

                    <input
                      id="nomorUrut"
                      name="nomorUrut"
                      type="number"
                      min="1"
                      step="1"
                      value={form.nomorUrut}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className={`theme-input w-full rounded-xl border px-3 py-3 text-sm font-medium outline-none transition ${themeFocus}`}
                    />

                    <p className="theme-text-muted mt-1 text-[11px]">
                      Gunakan bilangan bulat mulai dari 1.
                    </p>
                  </div>
                </div>

                {form.jenisSoal === "pilihan_ganda" && (
                  <div
                    className={`rounded-2xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 sm:p-5`}
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="theme-text flex items-center gap-2 text-sm font-bold">
                          <ListChecks size={15} className={themePrimaryText} />
                          Pilihan Jawaban
                        </h3>
                        <p className="theme-text-secondary mt-0.5 text-xs">
                          Minimal 2 dan maksimal 6 pilihan.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`theme-card theme-text-secondary rounded-full px-2.5 py-1 text-[11px] font-bold ${themeSmallShadow}`}
                        >
                          {form.pilihan.length} pilihan
                        </span>

                        {form.pilihan.length < 6 && (
                          <button
                            type="button"
                            onClick={addChoice}
                            disabled={saving}
                            className={`theme-card ${themePrimaryText} ${themeNeutralBorder} inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] disabled:opacity-50`}
                          >
                            <Plus size={14} />
                            Tambah
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {form.pilihan.map((pilihan, index) => {
                        const letter = getChoiceLetter(index);
                        const isCorrect =
                          String(form.jawabanBenar ?? "").trim() ===
                            String(pilihan ?? "").trim() &&
                          String(pilihan ?? "").trim() !== "";

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                              isCorrect
                                ? `${themeSuccessBorder} ${themeSuccessSurface}`
                                : `${themeNeutralBorder} theme-card`
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                isCorrect
                                  ? "bg-[var(--color-success)] text-[var(--color-card)]"
                                  : `${themeNeutralSurface} theme-text-secondary`
                              }`}
                            >
                              {letter}
                            </span>

                            <input
                              type="text"
                              value={pilihan}
                              onChange={(event) =>
                                handleChoiceChange(index, event.target.value)
                              }
                              disabled={saving}
                              placeholder={`Pilihan ${letter}`}
                              className={`theme-input min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none transition ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                            />

                            {form.pilihan.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeChoice(index)}
                                disabled={saving}
                                aria-label={`Hapus pilihan ${letter}`}
                                className="theme-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-50"
                              >
                                <X size={15} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5">
                      <label
                        htmlFor="jawabanBenar"
                        className="theme-text mb-2 flex items-center gap-2 text-sm font-semibold"
                      >
                        <Target
                          size={14}
                          className="text-[var(--color-success)]"
                        />
                        Jawaban Benar <span className="theme-danger">*</span>
                      </label>

                      <select
                        id="jawabanBenar"
                        name="jawabanBenar"
                        value={form.jawabanBenar}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        className={`theme-input w-full rounded-xl border px-3 py-3 text-sm font-medium outline-none transition ${themeFocus}`}
                      >
                        <option value="">Pilih jawaban yang benar</option>

                        {form.pilihan.map((item, index) => {
                          const value = String(item ?? "").trim();
                          if (!value) return null;

                          return (
                            <option key={`${index}-${value}`} value={value}>
                              {getChoiceLetter(index)} — {value}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div
                      className={`mt-4 rounded-xl border ${themeInfoBorder} ${themeInfoSurface} px-4 py-3`}
                    >
                      <p className="text-xs leading-5 text-[var(--color-info)]">
                        Kunci jawaban disimpan berdasarkan teks pilihan. Pastikan
                        setiap pilihan berbeda dan jawaban benar sesuai salah satu
                        pilihan yang tersedia.
                      </p>
                    </div>
                  </div>
                )}

                {form.jenisSoal === "benar_salah" && (
                  <div
                    className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4 sm:p-5`}
                  >
                    <h3 className="theme-text flex items-center gap-2 text-sm font-bold">
                      <ListChecks size={16} className={themePrimaryText} />
                      Kunci Jawaban Benar / Salah
                    </h3>

                    <p className="theme-text-secondary mt-1 text-xs leading-5">
                      Pilih jawaban yang akan digunakan sebagai kunci koreksi.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {["benar", "salah"].map((value) => {
                        const selected = form.jawabanBenar === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={saving}
                            onClick={() => {
                              setError("");
                              setForm((prev) => ({
                                ...prev,
                                jawabanBenar: value,
                              }));
                            }}
                            className={`rounded-xl border px-4 py-4 text-sm font-bold transition disabled:opacity-50 ${
                              selected
                                ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`
                                : `theme-card ${themeNeutralBorder} theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]`
                            }`}
                          >
                            {value === "benar" ? "Benar" : "Salah"}
                            {selected && (
                              <CheckCircle2
                                size={16}
                                className="mx-auto mt-2"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {form.jenisSoal === "esai" && (
                  <div
                    className={`rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-4 sm:p-5`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themeInfoSurface} text-[var(--color-info)] ${themeSmallShadow}`}
                      >
                        <FileText size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[var(--color-info)]">
                          Soal Esai
                        </p>
                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Soal esai tidak memerlukan pilihan jawaban. Penilaian
                          dapat dilakukan manual oleh guru.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`flex flex-col-reverse gap-3 border-t ${themeDivider} pt-5 sm:flex-row sm:justify-end`}
                >
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className={`theme-card theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover} w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 sm:w-auto`}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-5 py-2.5 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {isEdit ? "Simpan Perubahan" : "Tambah Soal"}
                      </>
                    )}
                  </button>
                </div>
              </form>

              <aside className="space-y-5">
                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <BookOpen size={17} />
                    </div>

                    <div>
                      <p className="theme-text-muted text-xs font-bold uppercase tracking-wide">
                        Ujian
                      </p>
                      <p className="theme-text text-sm font-bold">
                        Informasi Ujian
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div
                      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} px-3.5 py-3`}
                    >
                      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                        Judul
                      </p>
                      <p className="theme-text mt-1 break-words text-sm font-semibold">
                        {ujian?.judul || "-"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} px-3.5 py-3`}
                      >
                        <p className={`text-[10px] font-bold uppercase tracking-wide ${themePrimaryText}`}>
                          Kelas
                        </p>
                        <p className={`mt-1 break-words text-sm font-semibold ${themePrimaryText}`}>
                          {ujian?.kelasMapel?.kelas?.nama || "-"}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl border ${themeInfoBorder} ${themeInfoSurface} px-3.5 py-3`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-info)]">
                          Mapel
                        </p>
                        <p className="mt-1 break-words text-sm font-semibold text-[var(--color-info)]">
                          {ujian?.kelasMapel?.mataPelajaran?.nama || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`theme-card rounded-xl border ${themeNeutralBorder} px-3.5 py-3`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock3 size={12} className="theme-text-muted" />
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                            Durasi
                          </p>
                        </div>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {ujian?.durasi || 0} menit
                        </p>
                      </div>

                      <div
                        className={`theme-card rounded-xl border ${themeNeutralBorder} px-3.5 py-3`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ListChecks size={12} className="theme-text-muted" />
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">
                            Soal
                          </p>
                        </div>
                        <p className="theme-text mt-1 text-sm font-semibold">
                          {totalSoal} soal
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="theme-text-muted mb-1.5 text-[10px] font-bold uppercase tracking-wide">
                        Status
                      </p>

                      {ujian?.dipublikasikan ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border ${themeSuccessBorder} ${themeSuccessSurface} px-2.5 py-1.5 text-xs font-bold text-[var(--color-success)]`}
                        >
                          <CheckCircle2 size={12} />
                          Dipublikasi
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border ${themeWarningBorder} ${themeWarningSurface} px-2.5 py-1.5 text-xs font-bold text-[var(--color-warning)]`}
                        >
                          <AlertCircle size={12} />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border ${themeWarningBorder} ${themeWarningSurface} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeWarningSurface} text-[var(--color-warning)] ${themeSmallShadow}`}
                    >
                      <Lightbulb size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-warning)]">
                        Tips
                      </p>
                      <p className="theme-text text-sm font-bold">
                        Panduan Menulis Soal
                      </p>
                    </div>
                  </div>

                  <ul className="theme-text-secondary mt-4 space-y-2.5 text-xs leading-5">
                    <li>• Gunakan bahasa yang jelas dan tidak ambigu.</li>
                    <li>• Buat pilihan jawaban yang masuk akal.</li>
                    <li>• Pastikan kunci jawaban benar.</li>
                    <li>• Atur poin sesuai tingkat kesulitan soal.</li>
                  </ul>
                </div>

                <div
                  className={`rounded-2xl border ${themeSuccessBorder} ${themeSuccessSurface} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSuccessSurface} text-[var(--color-success)] ${themeSmallShadow}`}
                    >
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-success)]">
                        Validasi
                      </p>
                      <p className="theme-text text-sm font-bold">
                        Sebelum Disimpan
                      </p>
                    </div>
                  </div>

                  <ul className="theme-text-secondary mt-4 space-y-2.5 text-xs leading-5">
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      Teks soal minimal 5 karakter.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      Poin harus lebih dari 0.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      Nomor urut bilangan bulat positif.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      Pilihan ganda minimal 2 pilihan.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                      Kunci jawaban wajib dipilih untuk pilihan ganda dan benar/salah.
                    </li>
                  </ul>
                </div>

                <div
                  className={`theme-card rounded-2xl border ${themeNeutralBorder} p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                    >
                      <Info size={17} />
                    </div>

                    <div>
                      <p className="theme-text-muted text-xs font-bold uppercase tracking-wide">
                        Butuh Bantuan?
                      </p>
                      <p className="theme-text text-sm font-bold">
                        Info Singkat
                      </p>
                    </div>
                  </div>

                  <p className="theme-text-secondary mt-3 text-xs leading-5">
                    Nomor urut menentukan urutan soal saat ujian berlangsung.
                    Kamu dapat mengubahnya melalui halaman kelola soal.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
