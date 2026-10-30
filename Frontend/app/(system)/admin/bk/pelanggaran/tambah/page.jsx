"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search } from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  createPelanggaranSiswa,
  getKategoriPelanggaran,
} from "@/services/bk.service";
import { getSemuaSiswa } from "@/services/siswa.service";
import { getKelasSayaDariAnggota } from "@/services/kelas.service";
import { getKelasMapelSiswa } from "@/services/kelasMapel.service";

const inputClass =
  "theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm outline-none transition focus:border-[var(--color-primary)]";

async function cariKelasSiswa(siswa) {
  if (!siswa?.id) return null;

  if (siswa.kelas) {
    return typeof siswa.kelas === "object"
      ? siswa.kelas
      : { nama: String(siswa.kelas) };
  }

  if (
    siswa.kelasSiswa &&
    Array.isArray(siswa.kelasSiswa) &&
    siswa.kelasSiswa[0]?.kelas
  ) {
    return siswa.kelasSiswa[0].kelas;
  }

  try {
    const kmList = await getKelasMapelSiswa({ siswaId: siswa.id });
    if (Array.isArray(kmList) && kmList.length > 0 && kmList[0]?.kelas) {
      return kmList[0].kelas;
    }
  } catch (err) {
    console.warn("Gagal mendapatkan kelas dari kelasMapel siswa:", err);
  }

  try {
    const detailKelas = await getKelasSayaDariAnggota(siswa.id);
    if (detailKelas) {
      return detailKelas;
    }
  } catch (err) {
    console.warn("Gagal mendapatkan kelas dari anggota kelas:", err);
  }

  return null;
}

function SearchableSiswaSelect({
  value,
  onChange,
  daftarSiswa,
  loading = false,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedSiswa = useMemo(() => {
    if (!value) return null;
    return (
      daftarSiswa.find((item) => String(item.id) === String(value)) || null
    );
  }, [daftarSiswa, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return daftarSiswa;

    return daftarSiswa.filter((s) => {
      const nama = String(s.namaLengkap || s.namaPengguna || "").toLowerCase();
      const id = String(s.id || "").toLowerCase();
      const nis = String(s.nis || s.nisn || "").toLowerCase();
      return nama.includes(q) || id.includes(q) || nis.includes(q);
    });
  }, [daftarSiswa, query]);

  const handleSelect = (siswaId) => {
    onChange(siswaId);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-[42px] w-full items-center justify-between gap-2.5 rounded-xl border px-4 text-left text-sm font-medium shadow-sm outline-none transition theme-input ${
          open
            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
            : "hover:border-[var(--color-primary)]"
        } ${disabled || loading ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <div className="min-w-0 flex-1 truncate">
          {loading ? (
            <span className="theme-text-muted">Memuat daftar siswa dari backend...</span>
          ) : selectedSiswa ? (
            <span className="theme-text">
              <span className="font-semibold">
                {selectedSiswa.namaLengkap || selectedSiswa.namaPengguna}
              </span>{" "}
              <span className="font-mono text-xs opacity-75">
                (ID: {selectedSiswa.id})
              </span>
            </span>
          ) : (
            <span className="theme-text-placeholder">
              Pilih siswa dari daftar...
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 theme-text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
          />

          <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border theme-card theme-border shadow-2xl">
            <div className="border-b theme-border-soft p-2.5">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama, ID, atau NIS siswa..."
                  className="theme-input h-9 w-full rounded-lg border pl-8 pr-3 text-xs outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-xs theme-text-muted">
                  {daftarSiswa.length === 0
                    ? "Tidak ada data siswa yang tersedia dari Backend."
                    : "Siswa tidak ditemukan."}
                </div>
              ) : (
                filtered.map((siswa) => {
                  const isSelected = String(siswa.id) === String(value);
                  return (
                    <button
                      key={siswa.id}
                      type="button"
                      onClick={() => handleSelect(siswa.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition ${
                        isSelected
                          ? "bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-[var(--color-primary)] font-semibold"
                          : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm theme-text">
                          {siswa.namaLengkap || siswa.namaPengguna || "Siswa"}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] theme-text-muted">
                          <span className="font-mono">ID: {siswa.id}</span>
                          {siswa.nis && <span>• NIS: {siswa.nis}</span>}
                          {siswa.nisn && <span>• NISN: {siswa.nisn}</span>}
                        </div>
                      </div>

                      {isSelected && (
                        <Check
                          size={15}
                          className="shrink-0 text-[var(--color-primary)]"
                        />
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

export default function CreatePelanggaranPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [kategori, setKategori] = useState([]);
  const [daftarSiswa, setDaftarSiswa] = useState([]);
  const [kelasSiswa, setKelasSiswa] = useState(null);
  const [loadingKelas, setLoadingKelas] = useState(false);

  const [form, setForm] = useState({
    siswaId: "",
    kategoriPelanggaranId: "",
    tanggal: "",
    kronologi: "",
    poin: "",
    status: "tercatat",
    tindakLanjut: "",
    catatan: "",
  });

  useEffect(() => {
    async function loadInitialData() {
      try {
        setError("");
        setLoadingData(true);

        const [kategoriRes, siswaRes] = await Promise.all([
          getKategoriPelanggaran().catch((err) => {
            console.error("Gagal memuat kategori:", err);
            return [];
          }),
          getSemuaSiswa({ limit: 1000 }).catch((err) => {
            console.error("Gagal memuat daftar siswa:", err);
            return { data: [] };
          }),
        ]);

        setKategori(Array.isArray(kategoriRes) ? kategoriRes : []);

        const listSiswa = Array.isArray(siswaRes)
          ? siswaRes
          : Array.isArray(siswaRes?.data)
          ? siswaRes.data
          : [];
        setDaftarSiswa(listSiswa);
      } catch (err) {
        setError(err?.message || "Gagal memuat data formulir.");
      } finally {
        setLoadingData(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadKelas() {
      if (!form.siswaId) {
        setKelasSiswa(null);
        setLoadingKelas(false);
        return;
      }

      const currSiswa = daftarSiswa.find(
        (s) => String(s.id) === String(form.siswaId)
      );

      setLoadingKelas(true);
      try {
        const k = await cariKelasSiswa(currSiswa || { id: form.siswaId });
        if (active) {
          setKelasSiswa(k);
        }
      } catch (err) {
        if (active) {
          console.error("Gagal mendapatkan data kelas siswa:", err);
          setKelasSiswa(null);
        }
      } finally {
        if (active) {
          setLoadingKelas(false);
        }
      }
    }

    loadKelas();

    return () => {
      active = false;
    };
  }, [form.siswaId, daftarSiswa]);

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleKategoriChange(value) {
    const selectedKategori = kategori.find(
      (item) => item.id === value
    );

    setForm((prev) => ({
      ...prev,
      kategoriPelanggaranId: value,
      poin:
        selectedKategori?.poin !== undefined
          ? selectedKategori.poin
          : prev.poin,
    }));
  }

  function handleTindakLanjutChange(value) {
    setForm((prev) => ({
      ...prev,
      tindakLanjut: value,
      status: value.trim()
        ? "ditindaklanjuti"
        : "tercatat",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.siswaId.trim()) {
        throw new Error("Siswa wajib dipilih.");
      }

      if (!form.kategoriPelanggaranId) {
        throw new Error("Kategori pelanggaran wajib dipilih.");
      }

      if (!form.tanggal) {
        throw new Error("Tanggal wajib diisi.");
      }

      const finalStatus = form.tindakLanjut.trim()
        ? "ditindaklanjuti"
        : form.status || "tercatat";

      await createPelanggaranSiswa({
        siswaId: form.siswaId.trim(),
        kategoriPelanggaranId: form.kategoriPelanggaranId,
        tanggal: form.tanggal,
        kronologi: form.kronologi.trim() || null,
        poin: form.poin === "" ? null : Number(form.poin),
        status: finalStatus,
        tindakLanjut: form.tindakLanjut.trim() || null,
        catatan: form.catatan.trim() || null,
      });

      router.push("/admin/bk/pelanggaran");
    } catch (err) {
      setError(
        err?.message || "Gagal menyimpan data pelanggaran."
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedKategori = kategori.find(
    (item) => item.id === form.kategoriPelanggaranId
  );

  const selectedSiswa = useMemo(() => {
    if (!form.siswaId) return null;
    return (
      daftarSiswa.find((item) => String(item.id) === String(form.siswaId)) ||
      null
    );
  }, [daftarSiswa, form.siswaId]);

  const previewStatus = form.tindakLanjut.trim()
    ? "ditindaklanjuti"
    : form.status || "tercatat";

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" active="bk" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="theme-page flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">

            <div className="mb-7 flex items-start gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  theme-card
                  theme-text-muted
                  mt-1 flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl border
                  shadow-sm
                  transition
                  hover:opacity-80
                "
                title="Kembali"
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
                <div
                  className="
                    flex h-12 w-12 shrink-0
                    items-center justify-center
                    rounded-2xl
                    bg-[var(--color-primary)]
                    text-white
                    shadow-lg
                  "
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="theme-text text-[26px] font-bold leading-tight tracking-tight">
                    Catat Pelanggaran
                  </h1>

                  <p className="theme-text-muted mt-1 text-sm font-medium">
                    Isi data pelanggaran siswa dengan lengkap
                  </p>
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

                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

              <form
                onSubmit={handleSubmit}
                className="theme-card overflow-hidden rounded-2xl border shadow-xl"
              >
                <div className="theme-card-soft flex items-center gap-3 border-b px-6 py-5">
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
                      Informasi Pelanggaran
                    </h2>

                    <p className="theme-text-muted text-xs font-medium">
                      Lengkapi data berikut dengan benar
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2">
                  <Field label="Siswa" required>
                    <SearchableSiswaSelect
                      value={form.siswaId}
                      onChange={(id) => handleChange("siswaId", id)}
                      daftarSiswa={daftarSiswa}
                      loading={loadingData}
                      disabled={saving}
                    />
                  </Field>

                  <Field label="Kelas">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={
                          loadingKelas
                            ? "Memuat data kelas dari backend..."
                            : kelasSiswa
                            ? `${kelasSiswa.nama || "Kelas"} ${kelasSiswa.tingkat ? `(Tingkat ${kelasSiswa.tingkat})` : ""}`.trim()
                            : form.siswaId
                            ? "Siswa belum terdaftar di kelas aktif"
                            : "Pilih siswa terlebih dahulu"
                        }
                        placeholder="Otomatis terisi dari data backend"
                        className={`${inputClass} cursor-not-allowed opacity-85`}
                      />
                      {loadingKelas && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                        </span>
                      )}
                    </div>
                    <p className="theme-text-muted mt-1.5 text-xs">
                      Kelas siswa otomatis disinkronkan dari data Backend.
                    </p>
                  </Field>

                  <Field
                    label="Kategori Pelanggaran"
                    required
                  >
                    <select
                      required
                      value={form.kategoriPelanggaranId}
                      onChange={(e) =>
                        handleKategoriChange(
                          e.target.value
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Pilih kategori
                      </option>

                      {kategori.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.nama} - {item.poin} poin
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Tanggal"
                    required
                  >
                    <input
                      required
                      type="date"
                      value={form.tanggal}
                      onChange={(e) =>
                        handleChange(
                          "tanggal",
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Poin">
                    <input
                      type="number"
                      min="0"
                      value={form.poin}
                      onChange={(e) =>
                        handleChange(
                          "poin",
                          e.target.value
                        )
                      }
                      placeholder="Otomatis dari kategori"
                      className={inputClass}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Status">
                      <select
                        value={previewStatus}
                        onChange={(e) =>
                          handleChange(
                            "status",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="tercatat">
                          Tercatat
                        </option>

                        <option value="proses">
                          Proses
                        </option>

                        <option value="ditindaklanjuti">
                          Ditindaklanjuti
                        </option>

                        <option value="selesai">
                          Selesai
                        </option>
                      </select>

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Jika Tindak Lanjut diisi, status
                        otomatis menjadi &quot;Ditindaklanjuti&quot;.
                      </p>
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Kronologi">
                      <textarea
                        rows="4"
                        value={form.kronologi}
                        onChange={(e) =>
                          handleChange(
                            "kronologi",
                            e.target.value
                          )
                        }
                        placeholder="Jelaskan kronologi kejadian..."
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
                          handleTindakLanjutChange(
                            e.target.value
                          )
                        }
                        placeholder="Contoh: Siswa diberikan teguran dan diarahkan untuk mengikuti konseling dengan guru BK."
                        className={`${inputClass} resize-none`}
                      />

                      <p className="theme-text-muted mt-1.5 text-xs">
                        Mengisi tindak lanjut akan mengubah
                        status menjadi{" "}
                        <span className="font-bold text-[var(--color-success)]">
                          Ditindaklanjuti
                        </span>
                        .
                      </p>
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Catatan">
                      <textarea
                        rows="3"
                        value={form.catatan}
                        onChange={(e) =>
                          handleChange(
                            "catatan",
                            e.target.value
                          )
                        }
                        placeholder="Catatan tambahan..."
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                <div className="theme-card-soft flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t p-4 sm:px-6 sm:py-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="
                      theme-card
                      theme-text-secondary
                      w-full sm:w-auto
                      rounded-xl
                      border
                      px-5 py-2.5
                      text-sm font-bold
                      shadow-sm
                      transition
                      hover:opacity-80
                      text-center
                    "
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      theme-primary
                      inline-flex items-center justify-center gap-2
                      w-full sm:w-auto
                      rounded-xl
                      px-5 py-2.5
                      text-sm font-bold
                      shadow-lg
                      transition
                      hover:shadow-xl
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {saving ? (
                      <>
                        <span
                          className="
                            h-4 w-4 animate-spin rounded-full
                            border-2
                            border-white/40
                            border-t-white
                          "
                        />
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

                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>

              <aside className="space-y-5">

                <div className="theme-card relative overflow-hidden rounded-2xl border p-6 shadow-xl">
                  <div
                    className="
                      absolute -right-8 -top-8
                      h-24 w-24 rounded-full
                      bg-[var(--color-sidebar-active)]
                      opacity-60
                    "
                  />

                  <div className="relative">

                    <div className="mb-4 flex items-center gap-2">
                      <div className="theme-info flex h-7 w-7 items-center justify-center rounded-lg">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-base font-bold text-white shadow-md">
                        {selectedSiswa?.namaLengkap
                          ? selectedSiswa.namaLengkap.slice(0, 2).toUpperCase()
                          : form.siswaId
                          ? form.siswaId.slice(0, 2).toUpperCase()
                          : "?"}
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text truncate text-sm font-bold">
                          {selectedSiswa?.namaLengkap ||
                            selectedSiswa?.namaPengguna ||
                            (form.siswaId ? `ID: ${form.siswaId}` : "Siswa belum dipilih")}
                        </p>

                        <p className="theme-text-muted truncate text-xs font-medium">
                          {selectedSiswa?.id
                            ? `ID: ${selectedSiswa.id}`
                            : selectedKategori?.nama || "Kategori belum dipilih"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">

                      <PreviewRow
                        label="Kelas"
                        value={
                          loadingKelas
                            ? "Memuat..."
                            : kelasSiswa?.nama || (form.siswaId ? "Belum ada kelas" : "-")
                        }
                      />

                      <PreviewRow
                        label="Tanggal"
                        value={form.tanggal || "-"}
                      />

                      <PreviewRow
                        label="Poin"
                        value={
                          form.poin
                            ? `${form.poin} poin`
                            : "-"
                        }
                      />

                      <PreviewRow
                        label="Status"
                        value={previewStatus}
                        badge
                      />
                    </div>
                  </div>
                </div>

                <div className="theme-info relative overflow-hidden rounded-2xl border p-5">
                  <div className="flex items-start gap-3">

                    <div className="theme-card theme-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    <div>
                      <h4 className="theme-text text-sm font-bold">
                        Informasi
                      </h4>

                      <p className="theme-text-secondary mt-1 text-xs leading-5">
                        Poin otomatis mengikuti kategori
                        pelanggaran yang dipilih.
                        Status akan menjadi{" "}
                        <b>Ditindaklanjuti</b> apabila
                        tindak lanjut diisi.
                      </p>
                    </div>
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

function Field({ label, children, required }) {
  return (
    <div>
      <label className="theme-text mb-2 block text-sm font-semibold">
        {label}

        {required && (
          <span className="ml-1 text-[var(--color-danger)]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  badge,
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="theme-text-muted font-medium">
        {label}
      </span>

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