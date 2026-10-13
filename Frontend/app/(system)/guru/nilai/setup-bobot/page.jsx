"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Check,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  Info,
  Calculator,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

const INITIAL_COMPONENTS = [
  {
    id: "tugas",
    name: "Tugas",
    description: "Tugas harian dan latihan",
    weight: 30,
    color: "#2563EB",
  },
  {
    id: "uts",
    name: "Ujian Tengah Semester",
    description: "Evaluasi tengah semester",
    weight: 30,
    color: "#0D9488",
  },
  {
    id: "uas",
    name: "Ujian Akhir Semester",
    description: "Evaluasi akhir semester",
    weight: 40,
    color: "#7C3AED",
  },
];

const INITIAL_SUBJECTS = [
  {
    id: "matematika",
    name: "Matematika",
    className: "X IPA 1",
    year: "2026/2027",
    semester: "Ganjil",
  },
  {
    id: "indonesia",
    name: "Bahasa Indonesia",
    className: "X IPA 1",
    year: "2026/2027",
    semester: "Ganjil",
  },
  {
    id: "inggris",
    name: "Bahasa Inggris",
    className: "X IPA 2",
    year: "2026/2027",
    semester: "Ganjil",
  },
];

const formatPercent = (value) => `${Number(value) || 0}%`;

export default function SetupBobotPage() {
  const router = useRouter();

  const [subjects] = useState(INITIAL_SUBJECTS);
  const [selectedSubjectId, setSelectedSubjectId] = useState("matematika");
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [savedComponents, setSavedComponents] = useState(INITIAL_COMPONENTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWeight, setNewWeight] = useState("0");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSubject = subjects.find(
    (subject) => subject.id === selectedSubjectId
  );

  const totalWeight = useMemo(
    () =>
      components.reduce(
        (total, component) => total + (Number(component.weight) || 0),
        0
      ),
    [components]
  );

  const isValid = totalWeight === 100 && components.length > 0;

  const updateWeight = (id, value) => {
    const parsedValue = value === "" ? 0 : Number(value);

    setComponents((current) =>
      current.map((component) =>
        component.id === id
          ? {
              ...component,
              weight: Math.max(
                0,
                Math.min(100, Number.isFinite(parsedValue) ? parsedValue : 0)
              ),
            }
          : component
      )
    );

    setNotice("");
  };

  const addComponent = () => {
    const name = newName.trim();
    const weight = Number(newWeight);

    if (!name) {
      setNotice("Nama komponen penilaian wajib diisi.");
      return;
    }

    if (components.some(
      (component) => component.name.toLowerCase() === name.toLowerCase()
    )) {
      setNotice("Nama komponen tersebut sudah digunakan.");
      return;
    }

    if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
      setNotice("Bobot harus berada di antara 0–100%.");
      return;
    }

    setComponents((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name,
        description: "Komponen penilaian tambahan",
        weight,
        color: "#64748B",
      },
    ]);

    setNewName("");
    setNewWeight("0");
    setShowAddForm(false);
    setNotice("");
  };

  const removeComponent = (id) => {
    setComponents((current) =>
      current.filter((component) => component.id !== id)
    );
    setNotice("");
  };

  const resetComponents = () => {
    setComponents(savedComponents.map((component) => ({ ...component })));
    setNotice("Perubahan dikembalikan ke konfigurasi terakhir yang tersimpan.");
  };

  const saveComponents = async () => {
    if (!isValid) {
      setNotice(
        `Total bobot harus tepat 100%. Total saat ini ${totalWeight}%.`
      );
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      // Integrasikan endpoint penyimpanan backend di bagian ini.
      // Contoh payload:
      // {
      //   mataPelajaranId: selectedSubjectId,
      //   komponen: components.map(({ name, weight }) => ({ name, weight }))
      // }

      setSavedComponents(components.map((component) => ({ ...component })));
      setNotice(
        "Konfigurasi valid dan tersimpan di halaman ini. Hubungkan endpoint backend agar perubahan tersimpan permanen."
      );
    } finally {
      setSaving(false);
    }
  };

  const subjectLabel = selectedSubject
    ? `${selectedSubject.name} · ${selectedSubject.className}`
    : "Pilih mata pelajaran";

  return (
    <div className="flex min-h-screen w-full theme-page">
      <Sidebar role="guru" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: "Guru" }} />

        <main className="theme-page flex-1">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
            {/* Header halaman */}
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
                  Atur komposisi penilaian untuk setiap mata pelajaran.
                  Pastikan total bobot mencapai 100% sebelum menyimpan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={resetComponents}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_14%,transparent)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                >
                  <RotateCcw size={15} />
                  Reset perubahan
                </button>

                <button
                  type="button"
                  onClick={saveComponents}
                  disabled={!isValid || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Memproses..." : "Simpan konfigurasi"}
                </button>
              </div>
            </div>

            {/* Ringkasan */}
            <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Komponen penilaian
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {components.length}
                    </p>
                  </div>
                  <ClipboardList
                    size={19}
                    className="text-[var(--color-primary)]"
                  />
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Komponen aktif untuk mata pelajaran ini
                </p>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Total bobot
                    </p>
                    <p className="theme-text mt-2 text-3xl font-bold">
                      {totalWeight}
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
                      width: `${Math.min(totalWeight, 100)}%`,
                      backgroundColor: isValid ? "#0D9488" : "#2563EB",
                    }}
                  />
                </div>
              </article>

              <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="theme-text-secondary text-sm">
                      Status konfigurasi
                    </p>
                    <p className="theme-text mt-2 text-lg font-bold">
                      {isValid ? "Siap disimpan" : "Perlu penyesuaian"}
                    </p>
                  </div>

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isValid
                        ? "bg-teal-500/10 text-teal-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {isValid ? <Check size={17} /> : <Info size={17} />}
                  </span>
                </div>

                <p className="theme-text-secondary mt-3 text-xs">
                  {isValid
                    ? "Total bobot sudah tepat 100%."
                    : `Sesuaikan ${Math.abs(100 - totalWeight)}% lagi agar total menjadi 100%.`}
                </p>
              </article>
            </section>

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              {/* Konfigurasi utama */}
              <section className="theme-card min-w-0 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
                <div className="flex flex-col gap-4 border-b border-[color-mix(in_srgb,var(--color-text)_9%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="theme-text font-bold">
                      Komposisi penilaian
                    </h2>
                    <p className="theme-text-secondary mt-1 text-sm">
                      Sesuaikan persentase setiap komponen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddForm((current) => !current)}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[color-mix(in_srgb,var(--color-text)_14%,transparent)] px-3.5 py-2 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:self-auto"
                  >
                    <Plus size={16} />
                    Tambah komponen
                  </button>
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
                      value={selectedSubjectId}
                      onChange={(event) => {
                        setSelectedSubjectId(event.target.value);
                        setNotice("");
                      }}
                      className="theme-input w-full appearance-none rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] py-3 pl-10 pr-10 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} — {subject.className}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />
                  </div>

                  {selectedSubject && (
                    <p className="theme-text-secondary mt-2 text-xs">
                      Tahun ajaran {selectedSubject.year} · Semester{" "}
                      {selectedSubject.semester}
                    </p>
                  )}
                </div>

                {showAddForm && (
                  <div className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_3%,transparent)] p-5 sm:px-6">
                    <h3 className="theme-text text-sm font-bold">
                      Komponen baru
                    </h3>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
                      <input
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        placeholder="Contoh: Praktik"
                        maxLength={60}
                        className="theme-input min-w-0 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                      />

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newWeight}
                          onChange={(event) => setNewWeight(event.target.value)}
                          className="theme-input w-full rounded-lg border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] px-3 py-2.5 pr-8 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                        <span className="theme-text-secondary absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                          %
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={addComponent}
                        className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Tambahkan
                      </button>
                    </div>
                  </div>
                )}

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
                        <th className="w-12 px-4 py-3.5" />
                      </tr>
                    </thead>

                    <tbody>
                      {components.map((component) => (
                        <tr
                          key={component.id}
                          className="border-b border-[color-mix(in_srgb,var(--color-text)_7%,transparent)] last:border-b-0"
                        >
                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-9 w-1 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: component.color,
                                }}
                              />
                              <div>
                                <p className="theme-text font-semibold">
                                  {component.name}
                                </p>
                                <p className="theme-text-secondary mt-1 text-xs">
                                  {component.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="relative">
                              <input
                                aria-label={`Bobot ${component.name}`}
                                type="number"
                                min="0"
                                max="100"
                                value={component.weight}
                                onChange={(event) =>
                                  updateWeight(component.id, event.target.value)
                                }
                                className="theme-input w-full rounded-lg border border-[color-mix(in_srgb,var(--color-text)_14%,transparent)] px-3 py-2 pr-7 text-sm font-semibold outline-none focus:border-[var(--color-primary)]"
                              />
                              <span className="theme-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 text-xs">
                                %
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_9%,transparent)]">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${component.weight}%`,
                                    backgroundColor: component.color,
                                  }}
                                />
                              </div>
                              <span className="theme-text-secondary text-xs tabular-nums">
                                {formatPercent(component.weight)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => removeComponent(component.id)}
                              title={`Hapus ${component.name}`}
                              aria-label={`Hapus ${component.name}`}
                              className="rounded-md p-2 text-[var(--color-text-secondary)] transition hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                        <td className="theme-text px-5 py-4 font-bold sm:px-6">
                          Total bobot
                        </td>
                        <td
                          className={`px-4 py-4 font-bold tabular-nums ${
                            isValid ? "text-teal-600" : "text-amber-600"
                          }`}
                        >
                          {totalWeight}%
                        </td>
                        <td colSpan={2} className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              isValid ? "text-teal-600" : "text-amber-600"
                            }`}
                          >
                            {isValid ? <Check size={14} /> : <Info size={14} />}
                            {isValid ? "Sesuai" : "Belum sesuai"}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {notice && (
                  <div
                    role="status"
                    className="border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-5 py-4 sm:px-6"
                  >
                    <p className="theme-text-secondary text-sm leading-6">
                      {notice}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="theme-text-secondary flex items-start gap-2 text-xs leading-5">
                    <CircleHelp size={15} className="mt-0.5 shrink-0" />
                    Total bobot harus tepat 100% untuk konfigurasi yang valid.
                  </p>

                  <button
                    type="button"
                    onClick={saveComponents}
                    disabled={!isValid || saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={15} />
                    Simpan bobot
                  </button>
                </div>
              </section>

              {/* Panel samping */}
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
                    {components.map((component) => (
                      <div key={component.id}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="theme-text-secondary text-xs">
                            {component.name}
                          </span>
                          <span className="theme-text text-xs font-semibold tabular-nums">
                            {(80 * component.weight) / 100}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${component.weight}%`,
                              backgroundColor: component.color,
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
                        {components.reduce(
                          (total, component) =>
                            total + (80 * component.weight) / 100,
                          0
                        ).toFixed(1)}
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
                      Sebelum menyimpan
                    </h2>
                  </div>

                  <ul className="theme-text-secondary mt-3 space-y-2.5 text-xs leading-5">
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Pastikan kelas dan mata pelajaran sudah benar.
                    </li>
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Sesuaikan bobot dengan kebijakan penilaian sekolah.
                    </li>
                    <li className="flex gap-2">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      Periksa total agar tepat 100%.
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