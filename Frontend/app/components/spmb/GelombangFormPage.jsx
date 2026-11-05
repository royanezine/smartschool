"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  Route,
  Save,
  Eye,
  Info,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  createGelombangPpdb,
  getGelombangPpdb,
  getGelombangPpdbById,
  isGelombangEndpointMissing,
  updateGelombangPpdb,
} from "@/services/gelombangPpdb.service";
import { getJalurPpdb } from "@/services/jalurPpdb.service";
import SpmbBackendBlocker from "./SpmbBackendBlocker";

const themePrimaryText = "text-[var(--color-primary)]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function toDateInput(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (angka) => String(angka).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

const FORM_KOSONG = {
  nama: "",
  jalurPpdbId: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  kuota: "",
  status: "aktif",
};

export default function GelombangFormPage({ gelombangId }) {
  const router = useRouter();
  const modeEdit = Boolean(gelombangId);

  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [jalurList, setJalurList] = useState([]);
  const [loading, setLoading] = useState(modeEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [endpointUnavailable, setEndpointUnavailable] = useState(false);
  const [detailLoaded, setDetailLoaded] = useState(!modeEdit);

  const loadJalur = useCallback(async () => {
    try {
      const response = await getJalurPpdb();
      setJalurList(Array.isArray(response?.data) ? response.data : []);
    } catch {
      setJalurList([]);
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!modeEdit) {
      setForm(FORM_KOSONG);
      setDetailLoaded(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setEndpointUnavailable(false);
      setDetailLoaded(false);

      const response = await getGelombangPpdbById(gelombangId);
      const data = response?.data;

      setForm({
        nama: data?.nama || "",
        jalurPpdbId: data?.jalurPpdbId || "",
        tanggalMulai: toDateInput(data?.tanggalMulai),
        tanggalSelesai: toDateInput(data?.tanggalSelesai),
        kuota:
          data?.kuota === null || data?.kuota === undefined
            ? ""
            : String(data.kuota),
        status: data?.status || "aktif",
      });

      setDetailLoaded(true);
    } catch (err) {
      if (isGelombangEndpointMissing(err)) {
        setEndpointUnavailable(true);
      } else {
        setError(
          err instanceof Error ? err.message : "Gagal memuat gelombang."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [gelombangId, modeEdit]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadJalur();
      loadDetail();
    });
  }, [loadJalur, loadDetail]);

  function ubah(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function simpan(event) {
    event.preventDefault();

    if (!detailLoaded) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nama: form.nama.trim(),
        jalurPpdbId: form.jalurPpdbId || null,
        tanggalMulai: form.tanggalMulai,
        tanggalSelesai: form.tanggalSelesai,
        kuota: form.kuota === "" ? null : Number(form.kuota),
        status: form.status || "aktif",
      };

      if (modeEdit) {
        await updateGelombangPpdb(gelombangId, payload);
      } else {
        await createGelombangPpdb(payload);
      }

      router.push("/admin/spmb/gelombang");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan gelombang."
      );
    } finally {
      setSaving(false);
    }
  }

  if (endpointUnavailable) {
    return (
      <SpmbBackendBlocker
        title={modeEdit ? "Edit Gelombang" : "Tambah Gelombang"}
        description="Route gelombang PPDB belum dimount di Backend yang sedang berjalan, sehingga form tidak dapat digunakan."
        backHref="/admin/spmb/gelombang"
        backLabel="Kembali ke Gelombang"
        blockers={[
          {
            label: modeEdit
              ? "GET/PUT/DELETE /api/gelombang-ppdb/:id"
              : "GET/POST /api/gelombang-ppdb",
            detail:
              "Model GelombangPpdb dan migration sudah ada, tetapi route/controller belum tersedia di Backend/src dan permintaan ke endpoint ini menghasilkan 404.",
          },
        ]}
        notes={[
          "Form hanya ditampilkan setelah GET endpoint gelombang berhasil, agar tidak ada aksi simpan yang mengarah ke API yang belum tersedia.",
          "Halaman daftar gelombang tetap dapat dipakai untuk memantau status endpoint.",
        ]}
      />
    );
  }

  return (
    // ✅ ROOT pakai flex h-screen overflow-hidden
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* ✅ Header dibungkus shrink-0 */}
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((value) => !value)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ✅ Body flex min-h-0 flex-1 */}
        <div className="flex min-h-0 flex-1">
          
          {/* ✅ Main min-w-0 flex-1 overflow-y-auto */}
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            
            {/* ✅ Konten w-full (max-w dihapus agar melebar penuh saat zoom out) */}
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
              
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/spmb/gelombang"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Gelombang
                </Link>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="theme-text text-2xl font-bold">
                      {modeEdit ? "Edit Gelombang" : "Tambah Gelombang"}
                    </h1>
                    <p className="theme-text-muted mt-1 text-sm">
                      {modeEdit
                        ? "Perbarui periode pendaftaran, kuota, atau status gelombang PPDB."
                        : "Buat gelombang baru untuk mengatur jadwal dan kuota pendaftaran."}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* ✅ Grid 2 Kolom Responsif tanpa gap di tengah */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                
                {/* === FORM (KIRI) === */}
                <form
                  onSubmit={simpan}
                  className="theme-card theme-border flex h-fit min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm"
                >
                  {loading ? (
                    <div className="flex min-h-[320px] items-center justify-center p-8">
                      <div className="text-center">
                        <Loader2
                          size={28}
                          className="mx-auto animate-spin text-[var(--color-primary)]"
                        />
                        <p className="theme-text-muted mt-3 text-sm font-medium">
                          Memuat data gelombang...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 md:grid-cols-2">
                        
                        <div className="md:col-span-2">
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Nama Gelombang{" "}
                            <span className="text-[var(--color-danger)]">*</span>
                          </label>
                          <div className="relative">
                            <CalendarDays
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <input
                              type="text"
                              value={form.nama}
                              onChange={(event) => ubah("nama", event.target.value)}
                              required
                              maxLength={50}
                              placeholder="Contoh: Gelombang 1 - Reguler"
                              className="theme-input h-11 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                              autoFocus={!modeEdit}
                            />
                          </div>
                          <p className="theme-text-muted mt-2 text-xs">
                            Berikan nama yang membedakan gelombang ini dengan yang lain.
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Jalur SPMB (opsional)
                          </label>
                          <div className="relative">
                            <Route
                              size={18}
                              className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                            />
                            <select
                              value={form.jalurPpdbId}
                              onChange={(event) => ubah("jalurPpdbId", event.target.value)}
                              className="theme-input h-11 w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            >
                              <option value="">Semua jalur pendaftaran</option>
                              {jalurList.map((jalur) => (
                                <option key={jalur.id} value={jalur.id}>
                                  {jalur.nama}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="theme-text-muted mt-2 text-xs">
                            Pilih jalur spesifik jika gelombang ini dikhususkan untuk jalur tertentu.
                          </p>
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Tanggal Mulai <span className="text-[var(--color-danger)]">*</span>
                          </label>
                          <input
                            type="date"
                            value={form.tanggalMulai}
                            onChange={(event) => ubah("tanggalMulai", event.target.value)}
                            required
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Tanggal Selesai <span className="text-[var(--color-danger)]">*</span>
                          </label>
                          <input
                            type="date"
                            value={form.tanggalSelesai}
                            onChange={(event) => ubah("tanggalSelesai", event.target.value)}
                            required
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Kuota Pendaftar (opsional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.kuota}
                            onChange={(event) => ubah("kuota", event.target.value)}
                            placeholder="Kosongkan jika tidak dibatasi"
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>

                        <div>
                          <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                            Status Gelombang
                          </label>
                          <select
                            value={form.status}
                            onChange={(event) => ubah("status", event.target.value)}
                            className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                          </select>
                        </div>
                      </div>

                      <div className="theme-card-soft theme-border-soft mt-auto flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
                        <Link
                          href="/admin/spmb/gelombang"
                          className="theme-card theme-border theme-text-secondary inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition hover:opacity-80"
                        >
                          Batal
                        </Link>

                        <button
                          type="submit"
                          disabled={saving || !detailLoaded}
                          className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <Loader2 size={17} className="animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save size={17} />
                              <span>Simpan Gelombang</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                {/* === SIDEBAR CARD (KANAN) — Mengisi ruang kosong === */}
                <aside className="flex min-w-0 flex-col gap-4">
                  
                  {/* Card: Ringkasan Input */}
                  <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Eye className="h-4 w-4" />
                      </div>
                      <h2 className="theme-text text-sm font-bold">Ringkasan Input</h2>
                    </div>
                    <div className="p-4">
                      <div className="theme-card-soft theme-border rounded-xl border p-4 space-y-3">
                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Nama Gelombang
                          </p>
                          <p className="theme-text mt-1 break-words text-sm font-semibold">
                            {form.nama.trim() || "Belum diisi"}
                          </p>
                        </div>
                        <div className="theme-border-soft h-px" />
                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Jalur
                          </p>
                          <p className="theme-text mt-1 text-sm font-semibold">
                            {form.jalurPpdbId
                              ? jalurList.find((j) => String(j.id) === String(form.jalurPpdbId))?.nama || "Terpilih"
                              : "Semua Jalur"}
                          </p>
                        </div>
                        <div className="theme-border-soft h-px" />
                        <div>
                          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                            Status
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                form.status === "aktif" ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
                              }`}
                            />
                            <span className="theme-text text-sm font-semibold capitalize">
                              {form.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Card: Panduan Pengisian */}
                  <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <h2 className="theme-text text-sm font-bold">Panduan</h2>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3 text-xs leading-5">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                          <span className="theme-text-secondary">
                            Nama gelombang harus unik agar mudah dibedakan.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                          <span className="theme-text-secondary">
                            Pastikan tanggal selesai lebih besar dari tanggal mulai.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                          <span className="theme-text-secondary">
                            Kosongkan kuota jika pendaftar tidak dibatasi.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* Card: Info Biru */}
                  <section className="theme-info theme-border flex items-start gap-3 rounded-2xl border p-4">
                    <Info size={16} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
                    <p className="text-xs leading-5">
                      Gelombang yang berstatus <b>Aktif</b> akan langsung muncul di halaman pendaftaran publik (jika pendaftaran SPMB sedang dibuka).
                    </p>
                  </section>

                  {/* Card: Info Sistem */}
                  <section className="theme-card theme-border rounded-2xl border p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="theme-card-soft theme-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="theme-text text-sm font-bold">
                          Informasi Sistem
                        </h3>
                        <div className="theme-text-secondary mt-1.5 space-y-1.5 text-xs leading-5">
                          <p>• Data disimpan ke server secara realtime.</p>
                          <p>• Pastikan koneksi internet stabil.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </aside>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}