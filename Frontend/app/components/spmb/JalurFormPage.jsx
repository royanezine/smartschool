"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Route,
  Save,
  Users,
} from "lucide-react";

import {
  hasPermission,
  subscribeAuth,
} from "@/lib/auth";
import {
  createJalurPpdb,
  getJalurPpdbById,
  updateJalurPpdb,
} from "@/services/jalurPpdb.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryText = "text-[var(--color-primary)]";

const NAMA_MIN = 2;
const NAMA_MAX = 50;
const DESKRIPSI_MAX = 500;

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

  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

const FORM_KOSONG = {
  nama: "",
  deskripsi: "",
  kuota: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  status: "aktif",
};

export default function JalurFormPage({ jalurId }) {
  const router = useRouter();
  const modeEdit = Boolean(jalurId);

  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [loading, setLoading] = useState(modeEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [detailLoaded, setDetailLoaded] = useState(!modeEdit);

  const auth = useSyncExternalStore(
    subscribeAuth,
    () => {
      try {
        const raw = localStorage.getItem("auth");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    () => null
  );

  const canCreate = hasPermission(auth, "ppdb.create");
  const canUpdate = hasPermission(auth, "ppdb.update");

  const loadDetail = useCallback(async () => {
    if (!modeEdit || !jalurId) {
      setForm(FORM_KOSONG);
      setDetailLoaded(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setDetailLoaded(false);

      const response = await getJalurPpdbById(jalurId);
      const data = response?.data;

      if (!data) {
        throw new Error(
          response?.message || "Data jalur PPDB tidak ditemukan."
        );
      }

      setForm({
        nama: data.nama || "",
        deskripsi: data.deskripsi || "",
        kuota:
          data.kuota === null || data.kuota === undefined
            ? ""
            : String(data.kuota),
        tanggalMulai: toDateInput(data.tanggalMulai),
        tanggalSelesai: toDateInput(data.tanggalSelesai),
        status: String(data.status || "aktif").toLowerCase(),
      });

      setDetailLoaded(true);
    } catch (err) {
      console.error("GET DETAIL JALUR ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat detail jalur pendaftaran."
      );
    } finally {
      setLoading(false);
    }
  }, [jalurId, modeEdit]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  function ubah(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm(f) {
    const nama = String(f.nama || "").trim();
    if (nama.length < NAMA_MIN) {
      return `Nama jalur minimal ${NAMA_MIN} karakter.`;
    }
    if (nama.length > NAMA_MAX) {
      return `Nama jalur maksimal ${NAMA_MAX} karakter.`;
    }

    if (!String(f.kuota).trim()) {
      return "Kuota jalur wajib diisi.";
    }
    const kuotaNum = Number(f.kuota);
    if (!Number.isFinite(kuotaNum) || kuotaNum <= 0) {
      return "Kuota harus berupa angka positif lebih dari 0.";
    }

    if (String(f.deskripsi || "").length > DESKRIPSI_MAX) {
      return `Deskripsi maksimal ${DESKRIPSI_MAX} karakter.`;
    }

    if (f.tanggalMulai && f.tanggalSelesai) {
      const d1 = new Date(f.tanggalMulai);
      const d2 = new Date(f.tanggalSelesai);
      if (d2 < d1) {
        return "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
      }
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (modeEdit && !canUpdate) {
      setError(
        "Akses ditolak: akun ini tidak memiliki izin ppdb.update untuk mengubah jalur PPDB."
      );
      return;
    }

    if (!modeEdit && !canCreate) {
      setError(
        "Akses ditolak: akun ini tidak memiliki izin ppdb.create untuk menambah jalur PPDB."
      );
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim() || undefined,
        kuota: Number(form.kuota),
        tanggalMulai: form.tanggalMulai || undefined,
        tanggalSelesai: form.tanggalSelesai || undefined,
        status: form.status || "aktif",
      };

      if (modeEdit) {
        await updateJalurPpdb(jalurId, payload);
      } else {
        await createJalurPpdb(payload);
      }

      router.push("/admin/spmb/jalur");
    } catch (err) {
      console.error("SIMPAN JALUR ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan jalur PPDB."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/spmb/jalur"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Jalur
                </Link>

                <div>
                  <div className="theme-text-muted mb-2 flex items-center gap-2 text-xs">
                    <span>SPMB</span>
                    <span>/</span>
                    <span>Jalur Pendaftaran</span>
                    <span>/</span>
                    <span className={`${themePrimaryText} font-medium`}>
                      {modeEdit ? "Edit Jalur" : "Tambah Jalur"}
                    </span>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight">
                    {modeEdit ? "Edit Jalur Pendaftaran" : "Tambah Jalur Pendaftaran"}
                  </h1>
                  <p className="theme-text-muted mt-1 text-sm">
                    {modeEdit
                      ? "Perbarui informasi nama jalur, kuota, tanggal periode, atau status."
                      : "Buat jalur pendaftaran baru untuk membuka penerimaan peserta didik."}
                  </p>
                </div>
              </div>

              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm"
              >
                {loading ? (
                  <div className="flex min-h-[320px] items-center justify-center p-8">
                    <div className="text-center">
                      <Loader2
                        size={28}
                        className="mx-auto animate-spin text-[var(--color-primary)]"
                      />
                      <p className="theme-text-muted mt-3 text-sm font-medium">
                        Memuat data jalur...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Nama Jalur{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <div className="relative">
                          <Route
                            size={18}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="text"
                            value={form.nama}
                            onChange={(e) => ubah("nama", e.target.value)}
                            required
                            minLength={NAMA_MIN}
                            maxLength={NAMA_MAX}
                            placeholder="Contoh: Jalur Zonasi"
                            disabled={saving}
                            autoFocus={!modeEdit}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <p className="theme-text-muted mt-1.5 text-xs">
                          {form.nama.trim().length}/{NAMA_MAX} karakter (minimal {NAMA_MIN})
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Deskripsi (opsional)
                        </label>
                        <div className="relative">
                          <textarea
                            value={form.deskripsi}
                            onChange={(e) => ubah("deskripsi", e.target.value)}
                            rows={3}
                            maxLength={DESKRIPSI_MAX}
                            placeholder="Penjelasan singkat mengenai kriteria dan ketentuan jalur ini..."
                            disabled={saving}
                            className="theme-input w-full resize-none rounded-xl border p-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>
                        <p className="theme-text-muted mt-1 text-xs">
                          {form.deskripsi.length}/{DESKRIPSI_MAX} karakter
                        </p>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Kuota Siswa{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <div className="relative">
                          <Users
                            size={18}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={form.kuota}
                            onChange={(e) => ubah("kuota", e.target.value)}
                            required
                            placeholder="Contoh: 150"
                            disabled={saving}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Status Jalur
                        </label>
                        <select
                          value={form.status}
                          onChange={(e) => ubah("status", e.target.value)}
                          disabled={saving}
                          className="theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Tanggal Mulai (opsional)
                        </label>
                        <div className="relative">
                          <CalendarDays
                            size={18}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="date"
                            value={form.tanggalMulai}
                            onChange={(e) =>
                              ubah("tanggalMulai", e.target.value)
                            }
                            disabled={saving}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Tanggal Selesai (opsional)
                        </label>
                        <div className="relative">
                          <CalendarDays
                            size={18}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="date"
                            value={form.tanggalSelesai}
                            onChange={(e) =>
                              ubah("tanggalSelesai", e.target.value)
                            }
                            disabled={saving}
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="theme-neutral-surface flex flex-col-reverse gap-3 border-t theme-border p-6 sm:flex-row sm:items-center sm:justify-end">
                      <Link
                        href="/admin/spmb/jalur"
                        className="theme-card theme-border inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition hover:opacity-80"
                      >
                        Batal
                      </Link>

                      <button
                        type="submit"
                        disabled={saving || (modeEdit && !detailLoaded)}
                        className={`${themePrimaryGradient} inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {saving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            {modeEdit ? "Simpan Perubahan" : "Tambah Jalur"}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
