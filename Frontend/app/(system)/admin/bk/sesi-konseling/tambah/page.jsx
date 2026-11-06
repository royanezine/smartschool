"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import { createSesiKonseling } from "@/services/bk.service";
import { getSemuaSiswa } from "@/services/siswa.service";
import { getUsers } from "@/services/user.service";

const inputClass = `
  theme-input
  w-full rounded-xl border
  px-4 py-2.5 text-sm font-medium
  shadow-sm outline-none transition
  placeholder:text-[var(--color-text-placeholder)]
  hover:border-[var(--color-primary)]
  focus:border-[var(--color-primary)]
  disabled:cursor-not-allowed disabled:opacity-60
`;

const INITIAL_FORM = {
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

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function isActive(user) {
  const status = String(user?.status ?? "").toLowerCase().trim();
  return !status || status === "aktif";
}

function Field({ label, children, required }) {
  return (
    <div className="min-w-0">
      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--color-danger)" }}>
            *
          </span>
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
        <span className="theme-info inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-current/10">
          {value}
        </span>
      ) : (
        <span className="theme-text max-w-[65%] truncate text-right font-semibold">
          {value}
        </span>
      )}
    </div>
  );
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
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useState(null);

  const selectedOption = options.find((item) => String(item.id) === String(value));

  // Filter opsi berdasarkan ketikan
  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;

    return options.filter((item) => {
      const mainText = String(item?.[displayKey] || "").toLowerCase();
      const subText = String(item?.[subLabelKey] || "").toLowerCase();
      return mainText.includes(keyword) || subText.includes(keyword);
    });
  }, [options, query, displayKey, subLabelKey]);

  const handleSelect = (item) => {
    onChange(String(item.id));
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
      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
        {label}
        <span className="ml-1" style={{ color: "var(--color-danger)" }}>
          *
        </span>
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
            ? `${selectedOption[displayKey]}${
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
                  const isSelected = String(item.id) === String(value);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`
                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition
                        ${isSelected ? "theme-info" : "hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"}
                      `}
                    >
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {String(item[displayKey] || "?")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold theme-text">
                          {item[displayKey]}
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

export default function CreateSesiKonselingPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [error, setError] = useState("");
  const [masterError, setMasterError] = useState("");

  const [siswaList, setSiswaList] = useState([]);
  const [konselorList, setKonselorList] = useState([]);

  const [form, setForm] = useState(INITIAL_FORM);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadMasterData = useCallback(async () => {
    try {
      setLoadingMaster(true);
      setMasterError("");

      const [siswaResponse, konselorResponse] = await Promise.all([
        getSemuaSiswa({
          page: 1,
          limit: 1000,
        }),
        getUsers({
          page: 1,
          limit: 100,
          role: "guru",
          status: "aktif",
          sortBy: "namaLengkap",
          sortOrder: "asc",
        }),
      ]);

      const siswaData = extractList(siswaResponse);
      const konselorData = extractList(konselorResponse);

      const normalizedSiswa = siswaData
        .filter((item) => item?.id && item?.namaLengkap && isActive(item))
        .map((item) => ({
          id: String(item.id),
          namaLengkap: String(item.namaLengkap),
          nis: item.nis || item.nipd || "",
          nisn: item.nisn || "",
        }))
        .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap, "id"));

      const normalizedKonselor = konselorData
        .filter((item) => item?.id && item?.namaLengkap && isActive(item))
        .map((item) => ({
          id: String(item.id),
          namaLengkap: String(item.namaLengkap),
          nis: item.nip || item.jabatan || "",
        }))
        .sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap, "id"));

      setSiswaList(normalizedSiswa);
      setKonselorList(normalizedKonselor);

      if (normalizedSiswa.length === 0) {
        setMasterError("Belum ada data siswa aktif yang tersedia.");
      } else if (normalizedKonselor.length === 0) {
        setMasterError("Belum ada data guru aktif yang tersedia sebagai konselor.");
      }
    } catch (err) {
      console.error("GAGAL MEMUAT MASTER DATA KONSELING:", err);
      setMasterError(err?.message || "Gagal mengambil data siswa dan konselor.");
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const selectedSiswa = siswaList.find((item) => item.id === form.siswaId);
  const selectedKonselor = konselorList.find((item) => item.id === form.konselorId);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.siswaId) throw new Error("Silakan pilih siswa terlebih dahulu.");
      if (!form.tanggal) throw new Error("Tanggal sesi wajib diisi.");
      if (!form.topik.trim()) throw new Error("Topik konseling wajib diisi.");
      if (form.waktuMulai && form.waktuSelesai && form.waktuMulai >= form.waktuSelesai) {
        throw new Error("Waktu selesai harus setelah waktu mulai.");
      }

      await createSesiKonseling({
        siswaId: selectedSiswa.id,
        konselorId: selectedKonselor?.id || null,
        tanggal: form.tanggal,
        waktuMulai: form.waktuMulai || null,
        waktuSelesai: form.waktuSelesai || null,
        topik: form.topik.trim(),
        masalah: form.masalah.trim() || null,
        hasil: form.hasil.trim() || null,
        tindakLanjut: form.tindakLanjut.trim() || null,
        status: form.status,
        catatan: form.catatan.trim() || null,
      });

      router.push("/admin/bk/sesi-konseling");
    } catch (err) {
      setError(err?.message || "Gagal menyimpan sesi konseling.");
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
            {/* HEADER */}
            <div className="mb-7 flex items-start gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  theme-card theme-text-secondary theme-header-hover
                  mt-1 flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl border shadow-sm transition
                "
                title="Kembali"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-start gap-4">
                <div className="theme-primary relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                </div>

                <div>
                  <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                    Tambah Sesi Konseling
                  </h1>
                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Isi data sesuai informasi sesi konseling
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-sm">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {masterError && (
              <div className="theme-danger mb-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{masterError}</span>
                </div>
                <button type="button" onClick={loadMasterData} disabled={loadingMaster} className="shrink-0 font-bold underline">
                  Muat ulang
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
              {/* FORM */}
              <form onSubmit={handleSubmit} className="theme-card overflow-hidden rounded-2xl border shadow-xl">
                <div className="theme-card-soft flex items-center gap-3 border-b px-6 py-5">
                  <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-current/10">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="theme-text text-sm font-bold">Informasi Sesi</h2>
                    <p className="theme-text-muted text-xs font-medium">Lengkapi data berikut dengan benar</p>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  {/* SEARCHABLE SISWA */}
                  <div className="md:col-span-2">
                    <SearchableSelect
                      label="Nama Siswa"
                      value={form.siswaId}
                      onChange={(val) => updateField("siswaId", val)}
                      options={siswaList}
                      placeholder={loadingMaster ? "Memuat data siswa..." : "Pilih atau ketik nama siswa"}
                      disabled={loadingMaster || siswaList.length === 0}
                      displayKey="namaLengkap"
                      subLabelKey="nis"
                      emptyMessage="Siswa tidak ditemukan"
                    />
                    {selectedSiswa && (
                      <p className="theme-text-muted mt-2 text-xs">
                        Siswa dipilih: {selectedSiswa.namaLengkap}
                      </p>
                    )}
                  </div>

                  {/* SEARCHABLE KONSELOR */}
                  <div className="md:col-span-2">
                    <SearchableSelect
                      label="Nama Konselor"
                      value={form.konselorId}
                      onChange={(val) => updateField("konselorId", val)}
                      options={konselorList}
                      placeholder={loadingMaster ? "Memuat data guru..." : "Pilih atau ketik nama guru"}
                      disabled={loadingMaster || konselorList.length === 0}
                      displayKey="namaLengkap"
                      subLabelKey="nis"
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
                      onChange={(e) => updateField("tanggal", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => updateField("status", e.target.value)}
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
                      onChange={(e) => updateField("waktuMulai", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Waktu Selesai">
                    <input
                      type="time"
                      value={form.waktuSelesai}
                      onChange={(e) => updateField("waktuSelesai", e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Topik" required>
                      <input
                        required
                        maxLength={150}
                        value={form.topik}
                        onChange={(e) => updateField("topik", e.target.value)}
                        placeholder="Contoh: Kesulitan belajar matematika"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Masalah">
                      <textarea
                        rows={3}
                        value={form.masalah}
                        onChange={(e) => updateField("masalah", e.target.value)}
                        placeholder="Jelaskan masalah yang dihadapi siswa..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Hasil">
                      <textarea
                        rows={3}
                        value={form.hasil}
                        onChange={(e) => updateField("hasil", e.target.value)}
                        placeholder="Hasil dari sesi konseling..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Tindak Lanjut">
                      <textarea
                        rows={3}
                        value={form.tindakLanjut}
                        onChange={(e) => updateField("tindakLanjut", e.target.value)}
                        placeholder="Rencana tindak lanjut..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Catatan">
                      <textarea
                        rows={3}
                        value={form.catatan}
                        onChange={(e) => updateField("catatan", e.target.value)}
                        placeholder="Catatan tambahan..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                {/* ACTION */}
                <div className="theme-card-soft flex flex-wrap justify-end gap-3 border-t px-6 py-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="theme-card theme-text-secondary theme-header-hover rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving || loadingMaster || siswaList.length === 0}
                    className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Simpan Sesi
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* SIDEBAR PREVIEW */}
              <aside className="space-y-5">
                <div className="theme-card relative overflow-hidden rounded-2xl border p-6 shadow-xl">
                  <div
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60"
                    style={{ background: "var(--color-info-background)" }}
                  />

                  <div className="relative">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="theme-info flex h-7 w-7 items-center justify-center rounded-lg">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="theme-text-muted text-xs font-bold uppercase tracking-wider">Live Preview</h3>
                    </div>

                    <div className="theme-border-soft flex items-center gap-3 border-b pb-4">
                      <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-md">
                        {selectedSiswa?.namaLengkap?.slice(0, 2).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="theme-text truncate text-sm font-bold">
                          {selectedSiswa?.namaLengkap || "Siswa belum dipilih"}
                        </p>
                        <p className="theme-text-muted truncate text-xs font-medium">
                          {selectedKonselor ? `Konselor: ${selectedKonselor.namaLengkap}` : "Konselor belum dipilih"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <PreviewRow label="Topik" value={form.topik || "-"} />
                      <PreviewRow label="Tanggal" value={form.tanggal || "-"} />
                      <PreviewRow
                        label="Waktu"
                        value={
                          form.waktuMulai
                            ? `${form.waktuMulai}${form.waktuSelesai ? ` - ${form.waktuSelesai}` : ""}`
                            : "-"
                        }
                      />
                      <PreviewRow
                        label="Status"
                        value={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        badge
                      />
                    </div>
                  </div>
                </div>

                {/* TIPS */}
                <div className="theme-info relative overflow-hidden rounded-2xl border p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="theme-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Tips Pengisian</h4>
                      <p className="mt-1 text-xs leading-5 opacity-80">
                        Ketik nama siswa atau guru untuk mencari dengan cepat.
                        Pilih siswa dan konselor dari data yang tersedia.
                        Pastikan tanggal serta waktu sesi sudah benar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* MASTER DATA INFO */}
                <div className="theme-card rounded-2xl border p-5 shadow-sm">
                  <h4 className="theme-text text-sm font-bold">Data Master</h4>
                  <div className="mt-4 space-y-3">
                    <PreviewRow
                      label="Siswa tersedia"
                      value={loadingMaster ? "Memuat..." : `${siswaList.length} siswa`}
                    />
                    <PreviewRow
                      label="Guru tersedia"
                      value={loadingMaster ? "Memuat..." : `${konselorList.length} guru`}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}