"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Save,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { createBuku } from "@/services/perpustakaan.service";
import { getAuthRole, subscribeAuth } from "@/lib/auth";


const initialForm = {
  kodeBuku: "",
  isbn: "",
  judul: "",
  penulis: "",
  penerbit: "",
  tahunTerbit: "",
  tipe: "EBOOK",
  kategori: "",
  deskripsi: "",
  coverUrl: "",
  urlEbook: "",
  jumlah: 0,
  jumlahTersedia: 0,
  status: "aktif",
};

const inputClass =
  "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

// Enum KategoriBuku pada Backend (Prisma): nilai harus salah satu dari daftar ini.
const KATEGORI_BUKU = [
  "PELAJARAN",
  "NOVEL",
  "KOMIK",
  "ENSIKLOPEDIA",
  "KAMUS",
  "MAJALAH",
  "JURNAL",
  "BIOGRAFI",
  "AGAMA",
  "TEKNOLOGI",
  "SAINS",
  "SEJARAH",
  "BAHASA",
  "MATEMATIKA",
  "FIKSI",
  "NON_FIKSI",
];

const selectClass =
  "theme-input theme-border theme-text h-11 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const labelClass =
  "theme-text-secondary mb-2 block text-xs font-semibold";


export default function TambahBukuPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const userRole = useSyncExternalStore(
    subscribeAuth,
    () => getAuthRole() || "",
    () => ""
  );

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (userRole === "super_admin") {
      setError(
        "Akun Super Admin tidak terikat dengan sekolah tertentu. Modul perpustakaan dikelola pada tingkat sekolah. Silakan login atau beralih ke akun Admin Sekolah (contoh: admin@smartschool.com) atau Guru untuk menambahkan koleksi buku perpustakaan."
      );
      return;
    }

    const trimmedKode = form.kodeBuku?.trim() || "";
    const trimmedJudul = form.judul?.trim() || "";
    const trimmedPenulis = form.penulis?.trim() || "";
    const trimmedPenerbit = form.penerbit?.trim() || "";
    const trimmedIsbn = form.isbn?.trim() || "";
    const trimmedKategori = form.kategori?.trim() || "";
    const trimmedCoverUrl = form.coverUrl?.trim() || "";
    const trimmedUrlEbook = form.urlEbook?.trim() || "";

    if (!trimmedKode) {
      setError("Kode buku wajib diisi.");
      return;
    }
    if (trimmedKode.length > 50) {
      setError(`Kode buku maksimal 50 karakter (saat ini ${trimmedKode.length} karakter).`);
      return;
    }

    if (!trimmedJudul) {
      setError("Judul buku wajib diisi.");
      return;
    }
    if (trimmedJudul.length > 150) {
      setError(`Judul buku maksimal 150 karakter (saat ini ${trimmedJudul.length} karakter).`);
      return;
    }

    if (!trimmedPenulis) {
      setError("Penulis wajib diisi.");
      return;
    }
    if (trimmedPenulis.length > 100) {
      setError(`Penulis maksimal 100 karakter (saat ini ${trimmedPenulis.length} karakter).`);
      return;
    }

    if (trimmedPenerbit.length > 100) {
      setError(`Penerbit maksimal 100 karakter (saat ini ${trimmedPenerbit.length} karakter).`);
      return;
    }

    if (trimmedIsbn.length > 30) {
      setError(`ISBN maksimal 30 karakter (saat ini ${trimmedIsbn.length} karakter).`);
      return;
    }

    if (!trimmedKategori) {
      setError("Kategori wajib diisi.");
      return;
    }
    if (trimmedKategori.length > 50) {
      setError(`Kategori maksimal 50 karakter (saat ini ${trimmedKategori.length} karakter).`);
      return;
    }

    if (form.tipe === "EBOOK") {
      if (!trimmedUrlEbook) {
        setError("URL E-Book wajib diisi untuk tipe E-Book.");
        return;
      }
    }

    if (trimmedUrlEbook) {
      if (/^(?:data:|blob:|javascript:)/i.test(trimmedUrlEbook)) {
        setError("URL E-Book tidak boleh berupa file base64 / data URL. Masukkan URL web (http:// atau https://) yang valid.");
        return;
      }
      if (trimmedUrlEbook.length > 255) {
        setError(
          `URL E-Book melebihi batas 255 karakter (saat ini ${trimmedUrlEbook.length} karakter). URL tidak boleh dipotong agar tautan tidak rusak. Gunakan URL yang lebih ringkas atau tautan resmi.`
        );
        return;
      }
    }

    if (trimmedCoverUrl) {
      if (/^(?:data:|blob:|javascript:)/i.test(trimmedCoverUrl)) {
        setError("Cover URL tidak boleh berupa file base64 / data URL. Masukkan URL web (http:// atau https://) yang valid.");
        return;
      }
      if (trimmedCoverUrl.length > 255) {
        setError(
          `Cover URL melebihi batas 255 karakter (saat ini ${trimmedCoverUrl.length} karakter). URL tidak boleh dipotong agar tautan tidak rusak. Gunakan URL gambar yang lebih ringkas.`
        );
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        kodeBuku: trimmedKode,
        judul: trimmedJudul,
        penulis: trimmedPenulis,
        penerbit: trimmedPenerbit || undefined,
        isbn: trimmedIsbn || undefined,
        tipe: form.tipe,
        kategori: trimmedKategori,
        deskripsi: form.deskripsi?.trim() || undefined,
        coverUrl: trimmedCoverUrl || undefined,
        urlEbook: trimmedUrlEbook || undefined,
        jumlah: Number(form.jumlah || 0),
        status: form.status || "aktif",
      };

      if (form.tahunTerbit !== "" && form.tahunTerbit != null) {
        const tahun = Number(form.tahunTerbit);
        if (Number.isInteger(tahun) && tahun > 0) {
          payload.tahunTerbit = tahun;
        }
      }

      await createBuku(payload);
      router.push("/admin/perpustakaan/buku-digital");
    } catch (err) {
      console.error("Gagal menyimpan buku:", err);
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan buku."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/perpustakaan/buku-digital")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} />
              Kembali ke Data Buku
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                <BookOpen size={23} />
              </div>
              <div>
                <h1 className="theme-text text-2xl font-bold tracking-tight">
                  Tambah Data Buku
                </h1>
                <p className="theme-text-secondary mt-0.5 text-sm">
                  Tambahkan koleksi buku baru ke perpustakaan sekolah.
                </p>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {userRole === "super_admin" && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
                  <Info size={20} className="mt-0.5 shrink-0 text-amber-700" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900">
                      Perhatian Akun Super Admin
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800">
                      Akun Super Admin tidak terikat dengan sekolah manapun. Modul perpustakaan adalah modul tingkat sekolah. Untuk menambahkan koleksi buku, silakan beralih atau login menggunakan akun <strong>Admin Sekolah</strong> (contoh: <code>admin@smartschool.com</code>) atau <strong>Guru</strong>.
                    </p>
                  </div>
                </div>
              )}

              <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border px-5 py-4 sm:px-6">
                  <h2 className="theme-text text-sm font-semibold">
                    Informasi Buku
                  </h2>
                  <p className="theme-text-muted mt-1 text-xs">
                    Data utama identitas buku.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <div>
                    <label className={labelClass}>Kode Buku *</label>
                    <input
                      required
                      value={form.kodeBuku}
                      onChange={update("kodeBuku")}
                      placeholder="Contoh: BK-0001"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>ISBN</label>
                    <input
                      value={form.isbn}
                      onChange={update("isbn")}
                      placeholder="978-602-xxxx"
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Judul Buku *</label>
                    <input
                      required
                      value={form.judul}
                      onChange={update("judul")}
                      placeholder="Masukkan judul buku"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Penulis *</label>
                    <input
                      required
                      value={form.penulis}
                      onChange={update("penulis")}
                      placeholder="Nama penulis"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Penerbit</label>
                    <input
                      value={form.penerbit}
                      onChange={update("penerbit")}
                      placeholder="Nama penerbit"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Tahun Terbit</label>
                    <input
                      type="number"
                      min="0"
                      value={form.tahunTerbit}
                      onChange={update("tahunTerbit")}
                      placeholder="2025"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Tipe *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.tipe}
                        onChange={update("tipe")}
                        className={selectClass}
                      >
                        <option value="FISIK">Buku Fisik</option>
                        <option value="EBOOK">E-Book</option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Kategori *</label>
                    <div className="relative">
                      <select
                        required
                        value={form.kategori}
                        onChange={update("kategori")}
                        className={selectClass}
                      >
                        <option value="">Pilih kategori</option>
                        {KATEGORI_BUKU.map((kategori) => (
                          <option key={kategori} value={kategori}>
                            {kategori.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Jumlah Eksemplar</label>
                    <input
                      type="number"
                      min="0"
                      value={form.jumlah ?? 0}
                      onChange={update("jumlah")}
                      className={inputClass}
                    />
                    <p className="theme-text-muted mt-1.5 text-[11px]">
                      Jumlah eksemplar buku digital / lisensi e-book.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Status</label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={update("status")}
                        className={selectClass}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border px-5 py-4 sm:px-6">
                  <h2 className="theme-text text-sm font-semibold">
                    Media & Deskripsi
                  </h2>
                  <p className="theme-text-muted mt-1 text-xs">
                    Cover, URL e-book, dan deskripsi buku.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>
                        URL E-Book{form.tipe === "EBOOK" ? " *" : ""}
                      </label>
                      <span
                        className={`text-[11px] ${
                          form.urlEbook?.trim().length > 255
                            ? "font-semibold text-rose-500"
                            : "theme-text-muted"
                        }`}
                      >
                        {form.urlEbook?.trim().length || 0}/255
                      </span>
                    </div>
                    <input
                      type="url"
                      required={form.tipe === "EBOOK"}
                      value={form.urlEbook}
                      onChange={update("urlEbook")}
                      placeholder="https://..."
                      className={`${inputClass} ${
                        form.urlEbook?.trim().length > 255
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                          : ""
                      }`}
                    />
                    {form.urlEbook?.trim().length > 255 && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        Panjang URL ({form.urlEbook.trim().length} karakter) melebihi batas 255 karakter. URL tidak akan dipotong agar tautan tidak rusak. Silakan gunakan tautan yang lebih ringkas.
                      </p>
                    )}
                    {/^(?:data:|blob:|javascript:)/i.test(form.urlEbook?.trim() || "") && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        Data URL / base64 tidak didukung. Silakan gunakan tautan web langsung (http:// atau https://).
                      </p>
                    )}
                    <p className="theme-text-muted mt-1.5 text-[11px]">
                      Wajib diisi jika tipe buku adalah E-Book (maksimal 255 karakter).
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Cover URL</label>
                      <span
                        className={`text-[11px] ${
                          form.coverUrl?.trim().length > 255
                            ? "font-semibold text-rose-500"
                            : "theme-text-muted"
                        }`}
                      >
                        {form.coverUrl?.trim().length || 0}/255
                      </span>
                    </div>
                    <input
                      type="url"
                      value={form.coverUrl}
                      onChange={update("coverUrl")}
                      placeholder="https://..."
                      className={`${inputClass} ${
                        form.coverUrl?.trim().length > 255
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                          : ""
                      }`}
                    />
                    {form.coverUrl?.trim().length > 255 && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        Panjang URL ({form.coverUrl.trim().length} karakter) melebihi batas 255 karakter. URL tidak akan dipotong agar tautan tidak rusak. Silakan gunakan tautan yang lebih ringkas.
                      </p>
                    )}
                    {/^(?:data:|blob:|javascript:)/i.test(form.coverUrl?.trim() || "") && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        Data URL / base64 tidak didukung. Silakan gunakan tautan web langsung (http:// atau https://).
                      </p>
                    )}
                    <p className="theme-text-muted mt-1.5 text-[11px]">
                      Opsional. Tautan gambar cover (maksimal 255 karakter).
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Deskripsi</label>
                    <textarea
                      value={form.deskripsi}
                      onChange={update("deskripsi")}
                      rows={4}
                      placeholder="Deskripsi buku..."
                      className="theme-input theme-border theme-text w-full resize-none rounded-lg border px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/admin/perpustakaan/buku-digital")}
                  disabled={saving}
                  className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition hover:theme-card-soft"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Simpan Buku
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}