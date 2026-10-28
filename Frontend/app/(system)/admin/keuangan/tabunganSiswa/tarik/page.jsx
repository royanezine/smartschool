"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Info,
  Search,
  UserRound,
  Wallet,
  ChevronDown,
  Check,
  CalendarDays,
  FileText,
  DollarSign,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  tarikTabungan,
  cariSiswaTabungan,
  getDetailTabungan,
} from "@/services/tabungan.service";
import { getAkunKas } from "@/services/jurnalKas.service";

const INITIAL_FORM = {
  siswaId: "",
  akunKasId: "",
  jumlah: "",
  tanggal: new Date().toLocaleDateString("en-CA"),
  keterangan: "",
};

const inputClass =
  "theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

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

function formatRupiah(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Rp0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function TarikFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSiswaId = searchParams?.get("siswaId") || "";

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    siswaId: initialSiswaId,
  });

  const [siswaTerpilih, setSiswaTerpilih] = useState(null);
  const [akunTerpilih, setAkunTerpilih] = useState(null);

  const [kataKunciSiswa, setKataKunciSiswa] = useState("");
  const [kataKunciAkun, setKataKunciAkun] = useState("");

  const [hasilSiswa, setHasilSiswa] = useState([]);
  const [daftarAkunKas, setDaftarAkunKas] = useState([]);

  const [bukaDropdownSiswa, setBukaDropdownSiswa] = useState(false);
  const [bukaDropdownAkun, setBukaDropdownAkun] = useState(false);

  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingAkun, setLoadingAkun] = useState(true);
  const [loadingSiswaAwal, setLoadingSiswaAwal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  // Memuat akun kas aktif dari backend.
  useEffect(() => {
    let aktif = true;

    async function loadAkunKas() {
      setLoadingAkun(true);

      try {
        const response = await getAkunKas();
        const data = normalizeArray(response);

        const akunAktif = data.filter(
          (akun) =>
            String(akun.status || "").toLowerCase() === "aktif" &&
            !akun.dihapusPada
        );

        if (!aktif) return;

        setDaftarAkunKas(akunAktif);

        // Pilih otomatis jika hanya ada satu akun kas aktif.
        if (akunAktif.length === 1) {
          const akun = akunAktif[0];

          setAkunTerpilih(akun);
          setKataKunciAkun(
            `${akun.kode ? `${akun.kode} - ` : ""}${akun.nama}`
          );
          setForm((previous) => ({
            ...previous,
            akunKasId: akun.id,
          }));
        }
      } catch (err) {
        if (aktif) {
          setError(
            `Gagal memuat akun kas: ${getErrorMessage(err)}`
          );
        }
      } finally {
        if (aktif) setLoadingAkun(false);
      }
    }

    loadAkunKas();

    return () => {
      aktif = false;
    };
  }, []);

  // Pencarian siswa berdasarkan nama, minimal 2 karakter.
  useEffect(() => {
    let aktif = true;

    const keyword = kataKunciSiswa.trim();

    if (siswaTerpilih && keyword === siswaTerpilih.nama) {
      setHasilSiswa([]);
      setLoadingSiswa(false);
      return;
    }

    if (keyword.length < 2) {
      setHasilSiswa([]);
      setLoadingSiswa(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSiswa(true);

      try {
        const response = await cariSiswaTabungan(keyword, 10);
        const data = normalizeArray(response);

        if (aktif) {
          setHasilSiswa(data);
          setBukaDropdownSiswa(true);
        }
      } catch (err) {
        if (aktif) {
          setHasilSiswa([]);
          setError(getErrorMessage(err));
        }
      } finally {
        if (aktif) setLoadingSiswa(false);
      }
    }, 300);

    return () => {
      aktif = false;
      clearTimeout(timer);
    };
  }, [kataKunciSiswa, siswaTerpilih]);

  // Memuat data siswa otomatis jika halaman menerima ?siswaId=...
  useEffect(() => {
    if (!initialSiswaId) return;

    let aktif = true;

    async function loadSiswaAwal() {
      setLoadingSiswaAwal(true);

      try {
        const response = await getDetailTabungan(initialSiswaId);
        const detail = response?.data ?? response;

        const siswa = detail?.siswa;

        if (!aktif) return;

        if (siswa?.id) {
          const siswaData = {
            id: siswa.id,
            nama:
              siswa.namaLengkap ||
              siswa.nama ||
              siswa.name ||
              "Siswa",
            kelas: null,
          };

          setSiswaTerpilih(siswaData);
          setKataKunciSiswa(siswaData.nama);
          setForm((previous) => ({
            ...previous,
            siswaId: siswaData.id,
          }));
        }
      } catch (err) {
        if (aktif) {
          setError(
            `Gagal memuat data siswa: ${getErrorMessage(err)}`
          );
        }
      } finally {
        if (aktif) setLoadingSiswaAwal(false);
      }
    }

    loadSiswaAwal();

    return () => {
      aktif = false;
    };
  }, [initialSiswaId]);

  const akunKasTersaring = daftarAkunKas.filter((akun) => {
    const keyword = kataKunciAkun.trim().toLowerCase();

    if (!keyword) return true;

    return (
      String(akun.nama || "").toLowerCase().includes(keyword) ||
      String(akun.kode || "").toLowerCase().includes(keyword) ||
      String(akun.tipe || "").toLowerCase().includes(keyword)
    );
  });

  function pilihSiswa(siswa) {
    setSiswaTerpilih(siswa);
    setKataKunciSiswa(siswa.nama);
    updateForm("siswaId", siswa.id);
    setHasilSiswa([]);
    setBukaDropdownSiswa(false);
    setError("");
  }

  function pilihAkunKas(akun) {
    setAkunTerpilih(akun);
    setKataKunciAkun(
      `${akun.kode ? `${akun.kode} - ` : ""}${akun.nama}`
    );
    updateForm("akunKasId", akun.id);
    setBukaDropdownAkun(false);
    setError("");
  }

  function handleSiswaInput(value) {
    setKataKunciSiswa(value);
    setBukaDropdownSiswa(true);
    setError("");

    if (siswaTerpilih && value !== siswaTerpilih.nama) {
      setSiswaTerpilih(null);
      updateForm("siswaId", "");
    }
  }

  function handleAkunInput(value) {
    setKataKunciAkun(value);
    setBukaDropdownAkun(true);
    setError("");

    if (
      akunTerpilih &&
      value !==
        `${akunTerpilih.kode ? `${akunTerpilih.kode} - ` : ""}${akunTerpilih.nama}`
    ) {
      setAkunTerpilih(null);
      updateForm("akunKasId", "");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const jumlah = Number(form.jumlah);

    if (!form.siswaId.trim() || !siswaTerpilih) {
      setError(
        "Pilih nama siswa dari daftar pencarian terlebih dahulu."
      );
      return;
    }

    if (!form.akunKasId.trim() || !akunTerpilih) {
      setError(
        "Pilih akun kas aktif dari daftar terlebih dahulu."
      );
      return;
    }

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      setError("Jumlah transaksi harus lebih dari 0.");
      return;
    }

    if (!Number.isInteger(jumlah)) {
      setError("Jumlah transaksi harus berupa bilangan bulat.");
      return;
    }

    if (!form.tanggal) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      await tarikTabungan({
        siswaId: form.siswaId.trim(),
        akunKasId: form.akunKasId.trim(),
        jumlah,
        tanggal: form.tanggal,
        ...(form.keterangan.trim()
          ? { keterangan: form.keterangan.trim() }
          : {}),
      });

      setSuccess("Penarikan tabungan berhasil disimpan.");

      const siswaId = form.siswaId.trim();

      setTimeout(() => {
        router.push(
          `/admin/keuangan/tabunganSiswa/${siswaId}`
        );
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (submitting) return;
    router.push("/admin/keuangan/tabunganSiswa");
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <ArrowUpCircle size={23} />
          </div>

          <div className="min-w-0">
          

            <h1 className="text-2xl font-bold tracking-tight theme-text">
              Tarik Tabungan
            </h1>

            <p className="mt-1 text-sm theme-text-secondary">
              Catat penarikan dari rekening tabungan siswa.
            </p>
          </div>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <Info size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            Penarikan akan mengurangi saldo tabungan
          </p>
          <p className="mt-1 text-xs leading-5">
            Pastikan saldo siswa mencukupi. Sistem akan menolak
            penarikan jika saldo tidak cukup.
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
        {/* SECTION 1: Siswa & Akun Kas */}
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
                hint="Ketik minimal 2 karakter nama siswa, lalu pilih siswa dari daftar."
              >
                <div className="relative">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      required
                      autoComplete="off"
                      value={kataKunciSiswa}
                      onChange={(event) =>
                        handleSiswaInput(event.target.value)
                      }
                      onFocus={() => {
                        if (
                          !siswaTerpilih &&
                          kataKunciSiswa.trim().length >= 2
                        ) {
                          setBukaDropdownSiswa(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(
                          () => setBukaDropdownSiswa(false),
                          150
                        );
                      }}
                      placeholder="Cari nama siswa..."
                      className={`${inputClass} pl-10 pr-10`}
                      disabled={submitting || loadingSiswaAwal}
                    />

                    {loadingSiswa || loadingSiswaAwal ? (
                      <Loader2
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin theme-text-muted"
                      />
                    ) : siswaTerpilih ? (
                      <Check
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                      />
                    ) : (
                      <ChevronDown
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                    )}
                  </div>

                  {bukaDropdownSiswa &&
                    !siswaTerpilih &&
                    kataKunciSiswa.trim().length >= 2 && (
                      <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border theme-border theme-card shadow-lg">
                        {loadingSiswa ? (
                          <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm theme-text-muted">
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                            Mencari siswa...
                          </div>
                        ) : hasilSiswa.length > 0 ? (
                          hasilSiswa.map((siswa) => (
                            <button
                              key={siswa.id}
                              type="button"
                              onMouseDown={(event) =>
                                event.preventDefault()
                              }
                              onClick={() => pilihSiswa(siswa)}
                              className="flex w-full items-start gap-3 border-b theme-border px-4 py-3 text-left last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                            >
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                <UserRound size={17} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium theme-text">
                                  {siswa.nama ||
                                    siswa.namaLengkap ||
                                    "Nama siswa"}
                                </p>
                                {siswa.kelas && (
                                  <p className="mt-0.5 text-xs theme-text-muted">
                                    {siswa.kelas.nama}
                                    {siswa.kelas.tingkat
                                      ? ` • Tingkat ${siswa.kelas.tingkat}`
                                      : ""}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-sm theme-text-muted">
                            Siswa tidak ditemukan. Coba kata kunci
                            lain.
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {siswaTerpilih && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Siswa dipilih
                      </p>
                      <p className="mt-0.5 text-sm theme-text">
                        {siswaTerpilih.nama}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setSiswaTerpilih(null);
                        setKataKunciSiswa("");
                        setHasilSiswa([]);
                        updateForm("siswaId", "");
                      }}
                      className="rounded p-1 theme-text-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                      aria-label="Ganti siswa"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </Field>
            </div>

            {/* Pencarian akun kas */}
            <div className="2xl:col-span-3">
              <Field
                label="Akun Kas"
                required
                hint="Ketik nama atau kode akun kas, lalu pilih akun kas aktif."
              >
                <div className="relative">
                  <div className="relative">
                    <Wallet
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      required
                      autoComplete="off"
                      value={kataKunciAkun}
                      onChange={(event) =>
                        handleAkunInput(event.target.value)
                      }
                      onFocus={() => setBukaDropdownAkun(true)}
                      onBlur={() => {
                        setTimeout(
                          () => setBukaDropdownAkun(false),
                          150
                        );
                      }}
                      placeholder={
                        loadingAkun
                          ? "Memuat akun kas..."
                          : "Cari akun kas..."
                      }
                      className={`${inputClass} pl-10 pr-10`}
                      disabled={submitting || loadingAkun}
                    />

                    {loadingAkun ? (
                      <Loader2
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin theme-text-muted"
                      />
                    ) : akunTerpilih ? (
                      <Check
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                      />
                    ) : (
                      <ChevronDown
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                    )}
                  </div>

                  {bukaDropdownAkun && !akunTerpilih && (
                    <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border theme-border theme-card shadow-lg">
                      {loadingAkun ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm theme-text-muted">
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          Memuat akun kas...
                        </div>
                      ) : akunKasTersaring.length > 0 ? (
                        akunKasTersaring.map((akun) => (
                          <button
                            key={akun.id}
                            type="button"
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() => pilihAkunKas(akun)}
                            className="flex w-full items-start gap-3 border-b theme-border px-4 py-3 text-left last:border-b-0 hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                          >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                              <Wallet size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium theme-text">
                                {akun.kode
                                  ? `${akun.kode} - `
                                  : ""}
                                {akun.nama}
                              </p>
                              {akun.tipe && (
                                <p className="mt-0.5 text-xs theme-text-muted">
                                  {akun.tipe}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-sm theme-text-muted">
                          {daftarAkunKas.length === 0
                            ? "Tidak ada akun kas aktif yang tersedia."
                            : "Akun kas tidak ditemukan."}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {akunTerpilih && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        Akun kas dipilih
                      </p>
                      <p className="mt-0.5 text-sm theme-text">
                        {akunTerpilih.kode
                          ? `${akunTerpilih.kode} - `
                          : ""}
                        {akunTerpilih.nama}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setAkunTerpilih(null);
                        setKataKunciAkun("");
                        updateForm("akunKasId", "");
                      }}
                      className="rounded p-1 theme-text-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                      aria-label="Ganti akun kas"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </Field>
            </div>
          </div>
        </div>

        {/* SECTION 2: Detail Penarikan */}
        <div className="border-t theme-border pt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
              <DollarSign size={15} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide theme-text-placeholder">
              Detail Penarikan
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-6">
            {/* Jumlah */}
            <div className="2xl:col-span-3">
              <Field label="Jumlah (Rp)" required>
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
                {Number(form.jumlah) > 0 && (
                  <p className="text-xs theme-text-muted">
                    Nominal penarikan: {formatRupiah(form.jumlah)}
                  </p>
                )}
              </Field>
            </div>

            {/* Tanggal */}
            <div className="2xl:col-span-3">
              <Field label="Tanggal transaksi" required>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center theme-text-muted">
                    <CalendarDays size={17} />
                  </div>

                  <input
                    required
                    type="date"
                    value={form.tanggal}
                    onChange={(event) =>
                      updateForm("tanggal", event.target.value)
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
                      updateForm("keterangan", event.target.value)
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
              loadingAkun ||
              loadingSiswaAwal ||
              !siswaTerpilih ||
              !akunTerpilih
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowUpCircle size={16} />
            )}
            {submitting ? "Memproses..." : "Simpan Penarikan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TarikSuspenseFallback() {
  return (
    <div className="w-full">
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border theme-border theme-card">
        <Loader2
          size={28}
          className="animate-spin theme-primary-text"
        />
        <p className="text-sm font-medium theme-text">
          Memuat halaman tarik tabungan...
        </p>
        <p className="text-xs theme-text-muted">
          Menyiapkan form penarikan
        </p>
      </div>
    </div>
  );
}

export default function TarikTabunganPage() {
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
            <Suspense fallback={<TarikSuspenseFallback />}>
              <TarikFormContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}