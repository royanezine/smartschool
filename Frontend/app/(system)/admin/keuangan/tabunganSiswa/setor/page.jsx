"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Info,
  Search,
  ChevronDown,
  UserRound,
  Wallet,
  CalendarDays,
  FileText,
  DollarSign,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  setorTabungan,
  cariSiswaTabungan,
  getDetailTabungan,
} from "@/services/tabungan.service";

import { getAkunKas } from "@/services/jurnalKas.service";

const INITIAL_FORM = {
  siswaId: "",
  akunKasId: "",
  jumlah: "",
  tanggal: new Date().toISOString().slice(0, 10),
  keterangan: "",
};

const inputClass =
  "theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function normalizeArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

function formatRupiah(value) {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium theme-text">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && (
        <p className="text-xs leading-5 theme-text-muted">{hint}</p>
      )}
    </div>
  );
}

function SetorFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSiswaId = searchParams?.get("siswaId") || "";

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    siswaId: "",
  });

  const [searchSiswa, setSearchSiswa] = useState("");
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [siswaTerpilih, setSiswaTerpilih] = useState(null);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [dropdownSiswa, setDropdownSiswa] = useState(false);

  const [daftarAkunKas, setDaftarAkunKas] = useState([]);
  const [loadingAkunKas, setLoadingAkunKas] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const searchTimeout = useRef(null);
  const requestId = useRef(0);

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // Memuat akun kas dari service yang sudah tersedia.
  useEffect(() => {
    let cancelled = false;

    async function loadAkunKas() {
      setLoadingAkunKas(true);

      try {
        const response = await getAkunKas();
        const data = normalizeArray(response);

        if (cancelled) return;

        const aktif = data.filter(
          (akun) =>
            akun.status === "aktif" && !akun.dihapusPada
        );

        setDaftarAkunKas(aktif);

        // Otomatis memilih akun jika hanya ada satu akun aktif.
        if (aktif.length === 1) {
          setForm((previous) => ({
            ...previous,
            akunKasId: aktif[0].id,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            `Gagal memuat akun kas: ${getErrorMessage(err)}`
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAkunKas(false);
        }
      }
    }

    loadAkunKas();

    return () => {
      cancelled = true;
    };
  }, []);

  // Jika halaman dibuka dengan parameter siswaId, ambil nama siswa.
  useEffect(() => {
    if (!initialSiswaId) return;

    let cancelled = false;

    async function loadSiswaAwal() {
      try {
        const detail = await getDetailTabungan(initialSiswaId);

        if (cancelled || !detail?.siswa) return;

        const siswa = {
          id: detail.siswa.id,
          nama: detail.siswa.namaLengkap,
          kelas: null,
        };

        setSiswaTerpilih(siswa);
        setSearchSiswa(siswa.nama);
        setForm((previous) => ({
          ...previous,
          siswaId: siswa.id,
        }));
      } catch {
        // Jika detail tidak tersedia, pengguna masih bisa mencari siswa.
      }
    }

    loadSiswaAwal();

    return () => {
      cancelled = true;
    };
  }, [initialSiswaId]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      requestId.current += 1;
    };
  }, []);

  async function handleCariSiswa(value) {
    setSearchSiswa(value);
    setSiswaTerpilih(null);
    updateForm("siswaId", "");
    setDropdownSiswa(true);
    setError("");

    const currentRequest = ++requestId.current;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.trim().length < 2) {
      setDaftarSiswa([]);
      setLoadingSiswa(false);
      return;
    }

    setLoadingSiswa(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await cariSiswaTabungan(
          value.trim(),
          10
        );

        if (currentRequest !== requestId.current) return;

        setDaftarSiswa(normalizeArray(response));
      } catch (err) {
        if (currentRequest !== requestId.current) return;

        setDaftarSiswa([]);
        setError(getErrorMessage(err));
      } finally {
        if (currentRequest === requestId.current) {
          setLoadingSiswa(false);
        }
      }
    }, 300);
  }

  function pilihSiswa(siswa) {
    setSiswaTerpilih(siswa);
    setSearchSiswa(siswa.nama || siswa.namaLengkap || "");

    updateForm("siswaId", siswa.id);

    setDropdownSiswa(false);
    setDaftarSiswa([]);
    setError("");
  }

  function handleBack() {
    if (submitting) return;

    router.push("/admin/keuangan/tabunganSiswa");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const jumlah = Number(form.jumlah);

    if (!form.siswaId.trim()) {
      setError(
        "Pilih siswa dari daftar pencarian terlebih dahulu."
      );
      return;
    }

    if (!form.akunKasId.trim()) {
      setError("Pilih akun kas terlebih dahulu.");
      return;
    }

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      setError("Jumlah transaksi harus lebih dari 0.");
      return;
    }

    if (!form.tanggal) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      await setorTabungan({
        siswaId: form.siswaId,
        akunKasId: form.akunKasId,
        jumlah,
        tanggal: form.tanggal,
        ...(form.keterangan.trim()
          ? { keterangan: form.keterangan.trim() }
          : {}),
      });

      setSuccess("Setoran tabungan berhasil disimpan.");

      setTimeout(() => {
        router.push(
          `/admin/keuangan/tabunganSiswa/${form.siswaId}`
        );
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* HEADER HALAMAN — Kembali di kiri atas */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={handleBack}
          disabled={submitting}
          className={`${buttonSecondary} shrink-0`}
          title="Kembali ke daftar tabungan"
        >
          <ArrowLeft size={17} />
          Kembali
        </button>

        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <ArrowDownCircle size={23} />
          </div>

          <div className="min-w-0">
           

            <h1 className="text-2xl font-bold tracking-tight theme-text">
              Setor Tabungan
            </h1>

            <p className="mt-1 text-sm theme-text-secondary">
              Catat setoran ke rekening tabungan siswa.
            </p>
          </div>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="flex items-start gap-3 rounded-xl border theme-border theme-card p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Info size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium theme-text">
            Setoran akan tercatat di sistem
          </p>

          <p className="mt-1 text-xs leading-5 theme-text-muted">
            Pilih siswa dan akun kas dari daftar yang tersedia.
            Setoran yang berhasil akan menambah saldo tabungan
            siswa.
          </p>
        </div>
      </div>

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{success}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Permintaan gagal</p>
            <p className="mt-1 break-words">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Tutup pesan error"
            className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="theme-card space-y-6 rounded-xl border theme-border p-5 shadow-sm sm:p-6"
      >
        {/* SECTION 1: Data Siswa & Akun Kas */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
              <UserRound size={15} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide theme-text-placeholder">
              Siswa & Akun Kas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-6">
            {/* Pencarian nama siswa */}
            <div className="2xl:col-span-3">
              <Field
                label="Nama Siswa"
                required
                hint="Ketik minimal 2 karakter nama siswa, lalu pilih hasil pencarian."
              >
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center theme-text-muted">
                    <Search size={17} />
                  </div>

                  <input
                    required
                    value={searchSiswa}
                    onChange={(event) =>
                      handleCariSiswa(event.target.value)
                    }
                    onFocus={() => {
                      if (
                        searchSiswa.trim().length >= 2 &&
                        !siswaTerpilih
                      ) {
                        setDropdownSiswa(true);
                      }
                    }}
                    placeholder="Cari nama siswa..."
                    className={`${inputClass} pl-10 pr-10`}
                    disabled={submitting}
                    autoComplete="off"
                  />

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center theme-text-muted">
                    <ChevronDown size={17} />
                  </div>

                  {dropdownSiswa && (
                    <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border theme-border theme-card shadow-lg">
                      {loadingSiswa ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm theme-text-muted">
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Mencari siswa...
                        </div>
                      ) : searchSiswa.trim().length < 2 ? (
                        <div className="px-3 py-4 text-sm theme-text-muted">
                          Ketik minimal 2 karakter.
                        </div>
                      ) : daftarSiswa.length === 0 ? (
                        <div className="px-3 py-4 text-sm theme-text-muted">
                          Siswa tidak ditemukan.
                        </div>
                      ) : (
                        daftarSiswa.map((siswa) => (
                          <button
                            key={siswa.id}
                            type="button"
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() => pilihSiswa(siswa)}
                            className="flex w-full items-start gap-3 border-b theme-border px-3 py-3 text-left last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                              <UserRound size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium theme-text">
                                {siswa.nama || siswa.namaLengkap}
                              </p>

                              <p className="mt-1 text-xs theme-text-muted">
                                {siswa.kelas?.nama
                                  ? `Kelas ${siswa.kelas.nama}`
                                  : "Kelas belum tersedia"}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {siswaTerpilih && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border theme-border p-3">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <p className="text-sm font-medium theme-text">
                        {siswaTerpilih.nama ||
                          siswaTerpilih.namaLengkap}
                      </p>

                      <p className="text-xs theme-text-muted">
                        {siswaTerpilih.kelas?.nama
                          ? `Kelas ${siswaTerpilih.kelas.nama}`
                          : "Siswa dipilih"}
                      </p>
                    </div>
                  </div>
                )}
              </Field>
            </div>

            {/* Dropdown akun kas */}
            <div className="2xl:col-span-3">
              <Field
                label="Akun Kas"
                required
                hint="Pilih akun kas aktif yang digunakan untuk transaksi setoran."
              >
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center theme-text-muted">
                    <Wallet size={17} />
                  </div>

                  <select
                    required
                    value={form.akunKasId}
                    onChange={(event) =>
                      updateForm(
                        "akunKasId",
                        event.target.value
                      )
                    }
                    className={`${inputClass} appearance-none pl-10 pr-10`}
                    disabled={submitting || loadingAkunKas}
                  >
                    <option value="">
                      {loadingAkunKas
                        ? "Memuat akun kas..."
                        : "Pilih akun kas"}
                    </option>

                    {daftarAkunKas.map((akun) => (
                      <option key={akun.id} value={akun.id}>
                        {akun.kode
                          ? `${akun.kode} - `
                          : ""}
                        {akun.nama}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center theme-text-muted">
                    {loadingAkunKas ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </div>
                </div>

                {!loadingAkunKas &&
                  daftarAkunKas.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Tidak ada akun kas aktif yang tersedia.
                    </p>
                  )}
              </Field>
            </div>
          </div>
        </div>

        {/* SECTION 2: Detail Transaksi */}
        <div className="border-t theme-border pt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
              <DollarSign size={15} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide theme-text-placeholder">
              Detail Transaksi
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-6">
            {/* Jumlah setoran */}
            <div className="2xl:col-span-3">
              <Field label="Jumlah Setoran (Rp)" required>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.jumlah}
                  onChange={(event) =>
                    updateForm("jumlah", event.target.value)
                  }
                  placeholder="Contoh: 50000"
                  className={inputClass}
                  disabled={submitting}
                />

                {form.jumlah && Number(form.jumlah) > 0 && (
                  <p className="text-xs theme-text-muted">
                    Nominal: {formatRupiah(form.jumlah)}
                  </p>
                )}
              </Field>
            </div>

            {/* Tanggal transaksi */}
            <div className="2xl:col-span-3">
              <Field label="Tanggal Transaksi" required>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center theme-text-muted">
                    <CalendarDays size={17} />
                  </div>

                  <input
                    required
                    type="date"
                    value={form.tanggal}
                    onChange={(event) =>
                      updateForm(
                        "tanggal",
                        event.target.value
                      )
                    }
                    className={`${inputClass} pl-10`}
                    disabled={submitting}
                  />
                </div>
              </Field>
            </div>

            {/* Keterangan */}
            <div className="sm:col-span-2 2xl:col-span-6">
              <Field label="Keterangan">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-3 flex items-center theme-text-muted">
                    <FileText size={17} />
                  </div>

                  <textarea
                    rows={3}
                    value={form.keterangan}
                    onChange={(event) =>
                      updateForm(
                        "keterangan",
                        event.target.value
                      )
                    }
                    placeholder="Keterangan transaksi (opsional)"
                    className="theme-input w-full resize-y rounded-xl border py-2.5 pl-10 pr-3.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitting}
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className={buttonSecondary}
          >
            <ArrowLeft size={16} />
            Batal
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingAkunKas ||
              !form.siswaId ||
              !form.akunKasId
            }
            className={buttonPrimary}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowDownCircle size={16} />
            )}

            {submitting ? "Memproses..." : "Simpan Setoran"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SetorSuspenseFallback() {
  return (
    <div className="w-full">
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border theme-border theme-card">
        <Loader2
          size={28}
          className="animate-spin theme-primary-text"
        />

        <p className="text-sm font-medium theme-text">
          Memuat halaman setor tabungan...
        </p>

        <p className="text-xs theme-text-muted">
          Menyiapkan form setoran
        </p>
      </div>
    </div>
  );
}

export default function SetorTabunganPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Suspense fallback={<SetorSuspenseFallback />}>
              <SetorFormContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}