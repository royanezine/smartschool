"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
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

  const pad = (angka) =>
    String(angka).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(
    date.getUTCMonth() + 1
  )}-${pad(date.getUTCDate())}`;
}

const FORM_KOSONG = {
  nama: "",
  jalurPpdbId: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  kuota: "",
  status: "aktif",
};

export default function GelombangFormPage({
  gelombangId,
}) {
  const router = useRouter();
  const modeEdit = Boolean(gelombangId);

  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [jalurList, setJalurList] = useState([]);
  const [loading, setLoading] = useState(modeEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [endpointUnavailable, setEndpointUnavailable] =
    useState(false);
  const [detailLoaded, setDetailLoaded] = useState(!modeEdit);

  const loadJalur = useCallback(async () => {
    try {
      const response = await getJalurPpdb();
      setJalurList(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
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

      const response =
        await getGelombangPpdbById(gelombangId);

      const data = response?.data;

      setForm({
        nama: data?.nama || "",
        jalurPpdbId: data?.jalurPpdbId || "",
        tanggalMulai: toDateInput(
          data?.tanggalMulai
        ),
        tanggalSelesai: toDateInput(
          data?.tanggalSelesai
        ),
        kuota:
          data?.kuota === null ||
          data?.kuota === undefined
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
          err instanceof Error
            ? err.message
            : "Gagal memuat gelombang."
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
        kuota:
          form.kuota === ""
            ? null
            : Number(form.kuota),
        status: form.status || "aktif",
      };

      if (modeEdit) {
        await updateGelombangPpdb(
          gelombangId,
          payload
        );
      } else {
        await createGelombangPpdb(payload);
      }

      router.push("/admin/spmb/gelombang");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan gelombang."
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
            toggleSidebar={() =>
              setCollapsed((value) => !value)
            }
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
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/spmb/gelombang"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Gelombang
                </Link>

                <div>
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

              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form
                onSubmit={simpan}
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
                            className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="text"
                            value={form.nama}
                            onChange={(event) =>
                              ubah("nama", event.target.value)
                            }
                            required
                            maxLength={50}
                            placeholder="Contoh: Gelombang 1 - Reguler"
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                            autoFocus={!modeEdit}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Jalur SPMB (opsional)
                        </label>
                        <div className="relative">
                          <Route
                            size={18}
                            className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                          />
                          <select
                            value={form.jalurPpdbId}
                            onChange={(event) =>
                              ubah("jalurPpdbId", event.target.value)
                            }
                            className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          >
                            <option value="">
                              Semua jalur pendaftaran
                            </option>
                            {jalurList.map((jalur) => (
                              <option key={jalur.id} value={jalur.id}>
                                {jalur.nama}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Tanggal Mulai{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                          type="date"
                          value={form.tanggalMulai}
                          onChange={(event) =>
                            ubah("tanggalMulai", event.target.value)
                          }
                          required
                          className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        />
                      </div>

                      <div>
                        <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                          Tanggal Selesai{" "}
                          <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                          type="date"
                          value={form.tanggalSelesai}
                          onChange={(event) =>
                            ubah("tanggalSelesai", event.target.value)
                          }
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
                          onChange={(event) =>
                            ubah("kuota", event.target.value)
                          }
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
                          onChange={(event) =>
                            ubah("status", event.target.value)
                          }
                          className="theme-input h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    <div className="theme-card-soft theme-border-soft flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
