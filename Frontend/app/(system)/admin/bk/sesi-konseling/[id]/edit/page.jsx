"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getSesiKonselingById,
  updateSesiKonseling,
} from "@/services/bk.service";

import { getSemuaSiswa } from "@/services/siswa.service";
import { getUsers } from "@/services/user.service";

const inputClass =
  "theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-primary)]";

const initialForm = {
  siswaId: "",
  konselorId: "",
  tanggal: "",
  waktuMulai: "",
  waktuSelesai: "",
  topik: "",
  masalah: "",
  hasil: "",
  tindakLanjut: "",
  status: "dijadwalkan",
  catatan: "",
};

function extractArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.result)) return result.result;
  if (Array.isArray(result?.result?.data)) return result.result.data;
  return [];
}

function getPersonName(person) {
  return (
    person?.namaLengkap ||
    person?.nama ||
    person?.user?.namaLengkap ||
    person?.user?.nama ||
    person?.name ||
    ""
  );
}

function getPersonId(person) {
  return person?.id || person?.userId || "";
}

function getRelatedName(value) {
  if (!value) return "";
  if (typeof value === "string") return "";
  return getPersonName(value);
}

// ==========================================
// KOMPONEN SEARCHABLE SELECT
// ==========================================
function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  displayKey = "namaLengkap",
  subLabelKey = "nis",
  emptyMessage = "Tidak ada data",
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find(
    (item) => String(getPersonId(item)) === String(value)
  );

  // Filter opsi berdasarkan ketikan
  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;

    return options.filter((item) => {
      const mainText = String(getPersonName(item)).toLowerCase();
      const subText = String(item?.[subLabelKey] || "").toLowerCase();
      return mainText.includes(keyword) || subText.includes(keyword);
    });
  }, [options, query, subLabelKey]);

  const handleSelect = (item) => {
    onChange(String(getPersonId(item)));
    setQuery("");
    setOpen(false);
  };

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
  };

  return (
    <div className="relative">
      <label className="theme-text mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-danger)]">*</span>
        )}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`
          theme-input
          w-full rounded-xl border
          px-4 py-2.5 text-sm font-medium text-left
          shadow-sm outline-none transition
          hover:border-[var(--color-primary)]
          focus:border-[var(--color-primary)]
          flex items-center justify-between gap-2
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        <span className={`truncate ${selectedOption ? "theme-text" : "theme-text-muted"}`}>
          {selectedOption
            ? `${getPersonName(selectedOption)}${
                selectedOption[subLabelKey] ? ` — ${selectedOption[subLabelKey]}` : ""
              }`
            : placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 theme-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Overlay untuk menutup dropdown */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border theme-card shadow-xl">
            {/* Search Input */}
            <div className="border-b theme-border-soft p-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Ketik untuk mencari..."
                  className="theme-input h-10 w-full rounded-lg border pl-9 pr-3 text-xs outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* Daftar Opsi */}
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <svg
                    className="mx-auto h-6 w-6 theme-text-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="theme-text-muted mt-2 text-xs font-medium">
                    {emptyMessage}
                  </p>
                </div>
              ) : (
                filteredOptions.map((item) => {
                  const isSelected = String(getPersonId(item)) === String(value);
                  return (
                    <button
                      type="button"
                      key={getPersonId(item)}
                      onClick={() => handleSelect(item)}
                      className={`
                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition
                        ${isSelected ? "theme-info" : "hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"}
                      `}
                    >
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {String(getPersonName(item) || "?")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold theme-text">
                          {getPersonName(item)}
                        </p>
                        {item[subLabelKey] && (
                          <p className="truncate text-xs theme-text-muted">
                            {item[subLabelKey]}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <svg
                          className="h-4 w-4 shrink-0 text-[var(--color-primary)]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
// ==========================================

export default function EditSesiKonselingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [siswaList, setSiswaList] = useState([]);
  const [konselorList, setKonselorList] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [item, siswaResult, guruResult] =
          await Promise.all([
            getSesiKonselingById(String(id)),
            getSemuaSiswa({ page: 1, limit: 1000 }),
            getUsers({ page: 1, limit: 100, role: "guru" }),
          ]);

        const siswaData = extractArray(siswaResult);
        const guruData = extractArray(guruResult);

        if (!item) {
          throw new Error("Data sesi konseling tidak ditemukan.");
        }

        setSelectedItem(item);

        setSiswaList(
          siswaData.filter((siswa) => getPersonId(siswa))
        );

        setKonselorList(
          guruData.filter((guru) => {
            const status = String(
              guru?.status || guru?.user?.status || ""
            ).toLowerCase();

            return (
              getPersonId(guru) &&
              (!status ||
                ["aktif", "active", "1"].includes(status))
            );
          })
        );

        setForm({
          siswaId: item.siswaId || item.siswa?.id || "",
          konselorId:
            item.konselorId || item.konselor?.id || "",
          tanggal: item.tanggal
            ? String(item.tanggal).slice(0, 10)
            : "",
          waktuMulai: item.waktuMulai || "",
          waktuSelesai: item.waktuSelesai || "",
          topik: item.topik || "",
          masalah: item.masalah || "",
          hasil: item.hasil || "",
          tindakLanjut: item.tindakLanjut || "",
          status: item.status || "dijadwalkan",
          catatan: item.catatan || "",
        });
      } catch (err) {
        setError(err?.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const selectedSiswa = siswaList.find(
    (item) => String(getPersonId(item)) === String(form.siswaId)
  );

  const selectedKonselor = konselorList.find(
    (item) =>
      String(getPersonId(item)) === String(form.konselorId)
  );

  const siswaName =
    getPersonName(selectedSiswa) ||
    getRelatedName(selectedItem?.siswa) ||
    (form.siswaId ? "Siswa terpilih" : "-");

  const konselorName =
    getPersonName(selectedKonselor) ||
    getRelatedName(selectedItem?.konselor) ||
    (form.konselorId ? "Konselor terpilih" : "-");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.siswaId) {
      setError("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateSesiKonseling(id, {
        siswaId: form.siswaId,
        konselorId: form.konselorId || null,
        tanggal: form.tanggal,
        waktuMulai: form.waktuMulai || null,
        waktuSelesai: form.waktuSelesai || null,
        topik: form.topik,
        masalah: form.masalah || null,
        hasil: form.hasil || null,
        tindakLanjut: form.tindakLanjut || null,
        status: form.status || "dijadwalkan",
        catatan: form.catatan || null,
      });

      router.push("/admin/bk/sesi-konseling");
    } catch (err) {
      setError(
        err?.message || "Gagal menyimpan perubahan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-5 md:p-6 lg:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="theme-card theme-border theme-text-muted mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition hover:opacity-80"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-start gap-4">
                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                      Edit Sesi Konseling
                    </h1>
                    <p className="theme-text-muted mt-1 text-sm font-medium">
                      Perbarui data sesi konseling
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {loading ? (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center shadow-xl">
                <div className="theme-text-muted inline-flex items-center gap-2 text-sm font-medium">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
                  Memuat data...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
                <form
                  onSubmit={handleSubmit}
                  className="theme-card theme-border overflow-hidden rounded-2xl border shadow-xl"
                >
                  <div className="theme-card-soft theme-border-soft flex items-center gap-3 border-b px-6 py-5">
                    <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Sesi
                      </h2>
                      <p className="theme-text-muted text-xs font-medium">
                        Perbarui data berikut dengan benar
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 md:grid-cols-2">
                    {/* SEARCHABLE SISWA */}
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="Siswa"
                        required
                        value={form.siswaId}
                        onChange={(val) => handleChange("siswaId", val)}
                        options={siswaList}
                        placeholder="Pilih atau ketik nama siswa"
                        disabled={loading}
                        displayKey="namaLengkap"
                        subLabelKey="nis"
                        emptyMessage="Siswa tidak ditemukan"
                      />
                    </div>

                    {/* SEARCHABLE KONSELOR */}
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="Konselor"
                        value={form.konselorId}
                        onChange={(val) => handleChange("konselorId", val)}
                        options={konselorList}
                        placeholder="Pilih atau ketik nama guru"
                        disabled={loading}
                        displayKey="namaLengkap"
                        subLabelKey="nip"
                        emptyMessage="Guru tidak ditemukan"
                      />
                      <p className="theme-text-muted mt-2 text-xs">
                        Konselor dapat dipilih sesuai guru yang tersedia.
                      </p>
                    </div>

                    <Field label="Tanggal" required>
                      <input
                        required
                        type="date"
                        value={form.tanggal}
                        onChange={(e) =>
                          handleChange("tanggal", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          handleChange("status", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="dijadwalkan">Dijadwalkan</option>
                        <option value="berlangsung">Berlangsung</option>
                        <option value="selesai">Selesai</option>
                        <option value="dibatalkan">Dibatalkan</option>
                      </select>
                    </Field>

                    <Field label="Waktu Mulai">
                      <input
                        type="time"
                        value={form.waktuMulai}
                        onChange={(e) =>
                          handleChange("waktuMulai", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Waktu Selesai">
                      <input
                        type="time"
                        value={form.waktuSelesai}
                        onChange={(e) =>
                          handleChange("waktuSelesai", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Topik" required>
                        <input
                          required
                          value={form.topik}
                          onChange={(e) =>
                            handleChange("topik", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Masalah">
                        <textarea
                          rows="3"
                          value={form.masalah}
                          onChange={(e) =>
                            handleChange("masalah", e.target.value)
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Hasil">
                        <textarea
                          rows="3"
                          value={form.hasil}
                          onChange={(e) =>
                            handleChange("hasil", e.target.value)
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Tindak Lanjut">
                        <textarea
                          rows="3"
                          value={form.tindakLanjut}
                          onChange={(e) =>
                            handleChange("tindakLanjut", e.target.value)
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Catatan">
                        <textarea
                          rows="3"
                          value={form.catatan}
                          onChange={(e) =>
                            handleChange("catatan", e.target.value)
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="theme-card-soft theme-border-soft flex justify-end gap-3 border-t px-6 py-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="theme-card theme-border theme-text-secondary rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition hover:opacity-80"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <aside className="space-y-5">
                  <div className="theme-card theme-border relative overflow-hidden rounded-2xl border p-6 shadow-xl">
                    <div className="theme-info absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30" />

                    <div className="relative">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="theme-info flex h-7 w-7 items-center justify-center rounded-lg">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </div>

                        <h3 className="theme-text-muted text-xs font-bold uppercase tracking-wider">
                          Live Preview
                        </h3>
                      </div>

                      <div className="theme-border-soft flex items-center gap-3 border-b pb-4">
                        <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-md">
                          {siswaName !== "-"
                            ? siswaName.slice(0, 2).toUpperCase()
                            : "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text truncate text-sm font-bold">
                            {siswaName}
                          </p>
                          <p className="theme-text-muted truncate text-xs font-medium">
                            {konselorName !== "-"
                              ? `Konselor: ${konselorName}`
                              : "Belum ada konselor"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <PreviewRow
                          label="Topik"
                          value={form.topik || "-"}
                        />
                        <PreviewRow
                          label="Tanggal"
                          value={form.tanggal || "-"}
                        />
                        <PreviewRow
                          label="Waktu"
                          value={
                            form.waktuMulai
                              ? `${form.waktuMulai}${
                                  form.waktuSelesai
                                    ? ` - ${form.waktuSelesai}`
                                    : ""
                                }`
                              : "-"
                          }
                        />
                        <PreviewRow
                          label="Status"
                          value={
                            form.status.charAt(0).toUpperCase() +
                            form.status.slice(1)
                          }
                          badge
                        />
                      </div>
                    </div>
                  </div>

                  <div className="theme-warning relative overflow-hidden rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold">Perhatian</h4>
                        <p className="mt-1 text-xs leading-5 opacity-80">
                          Perubahan data akan langsung tersimpan dan
                          memengaruhi riwayat sesi konseling siswa.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="theme-text mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-danger)]">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

function PreviewRow({ label, value, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="theme-text-muted font-medium">{label}</span>

      {badge ? (
        <span className="theme-info inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold">
          {value}
        </span>
      ) : (
        <span className="theme-text truncate text-right font-semibold">
          {value}
        </span>
      )}
    </div>
  );
}