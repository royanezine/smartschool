"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MapPin,
  Package,
  Save,
  Tag,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  createAset,
  getAsetById,
  getGudang,
  getKategoriAset,
  updateAset,
} from "@/services/sarpras.service";
import {
  KONDISI_OPTIONS,
  STATUS_OPTIONS,
  extractData,
} from "./_utils";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const inputClass = `theme-input w-full rounded-xl py-2.5 text-sm transition-colors ${themeFocus}`;

const emptyForm = {
  kode: "",
  nama: "",
  kategoriAsetId: "",
  gudangId: "",
  kondisi: "baik",
  jumlah: "",
  jumlahStok: "",
  stokMinimum: "0",
  lokasi: "",
  status: "aktif",
};

function Field({ label, required, error, children, hint }) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-xs font-medium">
        {label} {required && <span className="theme-danger">*</span>}
      </label>

      {children}

      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-danger)]">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : (
        hint && (
          <p className="mt-1 text-[11px] theme-text-muted">{hint}</p>
        )
      )}
    </div>
  );
}

export default function InventarisForm({ mode = "tambah", id = "" }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [kategori, setKategori] = useState([]);
  const [gudangList, setGudangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let aktif = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const requests = [getKategoriAset(), getGudang()];

        if (isEdit) {
          requests.push(getAsetById(id));
        }

        const [kategoriResponse, gudangResponse, asetResponse] =
          await Promise.all(requests);

        if (!aktif) return;

        setKategori(extractData(kategoriResponse));
        setGudangList(extractData(gudangResponse));

        if (isEdit) {
          const aset = asetResponse?.data;

          if (!aset?.id) {
            throw new Error("Data inventaris tidak ditemukan.");
          }

          setForm({
            kode: aset.kode ?? "",
            nama: aset.nama ?? "",
            kategoriAsetId: String(
              aset.kategoriAsetId ?? aset.kategoriAset?.id ?? ""
            ),
            gudangId: String(
              aset.gudangId ?? aset.gudang?.id ?? ""
            ),
            kondisi: String(
              aset.kondisi ?? "baik"
            ).toLowerCase(),
            jumlah: String(aset.jumlah ?? ""),
            jumlahStok: String(aset.jumlahStok ?? ""),
            stokMinimum: String(aset.stokMinimum ?? 0),
            lokasi: aset.lokasi ?? "",
            status: aset.status ?? "aktif",
          });
        }
      } catch (err) {
        if (aktif) {
          setError(
            err?.message ||
              "Gagal memuat data pendukung inventaris."
          );
        }
      } finally {
        if (aktif) setLoading(false);
      }
    }

    load();

    return () => {
      aktif = false;
    };
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSaved(false);
    setError("");
  }

  function validate() {
    const errors = {};

    if (form.kode.trim().length < 2) {
      errors.kode = "Kode aset minimal 2 karakter.";
    }

    if (form.nama.trim().length < 3) {
      errors.nama = "Nama aset minimal 3 karakter.";
    }

    if (!form.kategoriAsetId) {
      errors.kategoriAsetId = "Kategori aset wajib dipilih.";
    }

    if (!form.gudangId) {
      errors.gudangId = "Gudang wajib dipilih.";
    }

    const jumlah = Number(form.jumlah);

    if (
      form.jumlah === "" ||
      !Number.isInteger(jumlah) ||
      jumlah < 1
    ) {
      errors.jumlah = "Jumlah harus bilangan bulat minimal 1.";
    }

    const jumlahStok = Number(form.jumlahStok);

    if (
      form.jumlahStok === "" ||
      !Number.isInteger(jumlahStok) ||
      jumlahStok < 0
    ) {
      errors.jumlahStok =
        "Jumlah stok harus bilangan bulat minimal 0.";
    } else if (
      Number.isInteger(jumlah) &&
      jumlahStok > jumlah
    ) {
      errors.jumlahStok =
        "Jumlah stok tidak boleh melebihi jumlah unit.";
    }

    const stokMinimum = Number(form.stokMinimum);

    if (
      form.stokMinimum === "" ||
      !Number.isInteger(stokMinimum) ||
      stokMinimum < 0
    ) {
      errors.stokMinimum =
        "Stok minimum harus bilangan bulat minimal 0.";
    } else if (
      Number.isInteger(jumlah) &&
      stokMinimum > jumlah
    ) {
      errors.stokMinimum =
        "Stok minimum tidak boleh melebihi jumlah unit.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const payload = {
        kode: form.kode.trim(),
        nama: form.nama.trim(),
        kategoriAsetId: form.kategoriAsetId,
        gudangId: form.gudangId,
        kondisi: form.kondisi,
        jumlah: Number(form.jumlah),
        jumlahStok: Number(form.jumlahStok),
        stokMinimum: Number(form.stokMinimum),
        lokasi: form.lokasi.trim() || null,
        status: form.status,
      };

      const response = isEdit
        ? await updateAset(id, payload)
        : await createAset(payload);

      setSaved(true);

      const nextId =
        response?.data?.id || (isEdit ? id : "");

      setTimeout(() => {
        if (nextId) {
          router.push(
            `/admin/sarpras/iventaris/${encodeURIComponent(nextId)}`
          );
        } else {
          router.push("/admin/sarpras/iventaris");
        }

        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err?.message ||
          `Gagal ${isEdit ? "memperbarui" : "menyimpan"} inventaris.`
      );
    } finally {
      setSaving(false);
    }
  }

  const noKategori = !loading && kategori.length === 0;
  const noGudang = !loading && gudangList.length === 0;
  const formBlocked = noKategori || noGudang;

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((value) => !value)}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((value) => !value)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-5xl space-y-5">
            <div>
              <button
                type="button"
                onClick={() => router.push("/admin/sarpras/iventaris")}
                className="theme-text-muted mb-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={14} />
                Kembali ke Inventaris
              </button>

              <p className="text-xs font-medium uppercase tracking-wide theme-primary">
                Sarana &amp; Prasarana
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight theme-text sm:text-2xl lg:text-[28px]">
                {isEdit ? "Edit Inventaris" : "Tambah Inventaris"}
              </h1>

              <p className="mt-1 text-sm theme-text-secondary">
                {isEdit
                  ? "Perbarui data barang inventaris dan stoknya."
                  : "Lengkapi data barang inventaris yang akan ditambahkan."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-danger)]">
                    {isEdit
                      ? "Gagal memperbarui inventaris"
                      : "Gagal menyimpan inventaris"}
                  </p>
                  <p className="mt-0.5 text-xs theme-text-secondary">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {saved && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-4 py-3 text-sm text-[var(--color-success)]"
              >
                <CheckCircle2 size={17} />
                Inventaris berhasil disimpan. Mengalihkan ke detail...
              </div>
            )}

            {formBlocked && (
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] px-4 py-3 text-sm">
                <p className="font-semibold text-[var(--color-warning)]">
                  Data pendukung belum lengkap
                </p>
                <p className="mt-1 text-xs theme-text-secondary">
                  {noKategori && (
                    <>
                      Belum ada kategori aset.{" "}
                      <button
                        type="button"
                        onClick={() =>
                          router.push("/admin/sarpras/kategori/tambah")
                        }
                        className="font-semibold underline"
                      >
                        Tambah kategori
                      </button>
                      .{" "}
                    </>
                  )}
                  {noGudang && (
                    <>
                      Belum ada gudang.{" "}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/gudang/master/tambah"
                          )
                        }
                        className="font-semibold underline"
                      >
                        Tambah gudang
                      </button>
                      .
                    </>
                  )}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className={`theme-card ${themeDivider} ${themeCardShadow} overflow-hidden rounded-2xl border`}
            >
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-[var(--color-primary)]"
                    />
                    <p className="mt-3 text-xs font-medium theme-text-muted">
                      Memuat data inventaris...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-5 p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Kode Barang"
                        required
                        error={fieldErrors.kode}
                      >
                        <input
                          type="text"
                          value={form.kode}
                          onChange={(event) =>
                            updateField("kode", event.target.value)
                          }
                          maxLength={50}
                          placeholder="Contoh: AST-FUR-001"
                          className={`${inputClass} px-4`}
                        />
                      </Field>

                      <Field
                        label="Nama Barang"
                        required
                        error={fieldErrors.nama}
                      >
                        <div className="relative">
                          <Package
                            size={16}
                            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="text"
                            value={form.nama}
                            onChange={(event) =>
                              updateField("nama", event.target.value)
                            }
                            maxLength={100}
                            placeholder="Contoh: Kursi Siswa"
                            className={`${inputClass} pl-10 pr-4`}
                          />
                        </div>
                      </Field>

                      <Field
                        label="Kategori"
                        required
                        error={fieldErrors.kategoriAsetId}
                      >
                        <div className="relative">
                          <Tag
                            size={16}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <select
                            value={form.kategoriAsetId}
                            onChange={(event) =>
                              updateField(
                                "kategoriAsetId",
                                event.target.value
                              )
                            }
                            disabled={formBlocked}
                            className={`${inputClass} appearance-none pl-10 pr-9`}
                          >
                            <option value="">Pilih kategori</option>
                            {kategori.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nama}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={15}
                            className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                          />
                        </div>
                      </Field>

                      <Field
                        label="Gudang"
                        required
                        error={fieldErrors.gudangId}
                      >
                        <div className="relative">
                          <Boxes
                            size={16}
                            className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                          />
                          <select
                            value={form.gudangId}
                            onChange={(event) =>
                              updateField("gudangId", event.target.value)
                            }
                            disabled={formBlocked}
                            className={`${inputClass} appearance-none pl-10 pr-9`}
                          >
                            <option value="">Pilih gudang</option>
                            {gudangList.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nama}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={15}
                            className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                          />
                        </div>
                      </Field>

                      <Field label="Kondisi" error={fieldErrors.kondisi}>
                        <select
                          value={form.kondisi}
                          onChange={(event) =>
                            updateField("kondisi", event.target.value)
                          }
                          className={`${inputClass} px-4`}
                        >
                          {KONDISI_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Status" error={fieldErrors.status}>
                        <select
                          value={form.status}
                          onChange={(event) =>
                            updateField("status", event.target.value)
                          }
                          className={`${inputClass} px-4`}
                        >
                          {STATUS_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field
                        label="Jumlah Unit"
                        required
                        error={fieldErrors.jumlah}
                      >
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={form.jumlah}
                          onChange={(event) =>
                            updateField("jumlah", event.target.value)
                          }
                          placeholder="Contoh: 20"
                          className={`${inputClass} px-4`}
                        />
                      </Field>

                      <Field
                        label="Jumlah Stok"
                        required
                        error={fieldErrors.jumlahStok}
                      >
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.jumlahStok}
                          onChange={(event) =>
                            updateField("jumlahStok", event.target.value)
                          }
                          placeholder="Contoh: 18"
                          className={`${inputClass} px-4`}
                        />
                      </Field>

                      <Field
                        label="Stok Minimum"
                        required
                        error={fieldErrors.stokMinimum}
                        hint="Batas peringatan stok menipis."
                      >
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.stokMinimum}
                          onChange={(event) =>
                            updateField("stokMinimum", event.target.value)
                          }
                          placeholder="Contoh: 5"
                          className={`${inputClass} px-4`}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Lokasi"
                      error={fieldErrors.lokasi}
                      hint="Lokasi fisik barang di dalam gedung atau gudang."
                    >
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <input
                          type="text"
                          value={form.lokasi}
                          onChange={(event) =>
                            updateField("lokasi", event.target.value)
                          }
                          maxLength={100}
                          placeholder="Contoh: Ruang Kelas 7A"
                          className={`${inputClass} pl-10 pr-4`}
                        />
                      </div>
                    </Field>

                  </div>

                  <div
                    className={`flex flex-col-reverse gap-2.5 border-t ${themeDivider} ${themeNeutralSurface} px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-5`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/sarpras/iventaris")
                      }
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium theme-text-secondary transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] sm:w-auto`}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving || formBlocked || saved}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-card)] transition-all sm:w-auto ${
                        saving || formBlocked || saved
                          ? `${themeNeutralSurface} cursor-not-allowed theme-text-placeholder`
                          : `${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-[1.04]`
                      }`}
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving
                        ? "Menyimpan..."
                        : isEdit
                          ? "Simpan Perubahan"
                          : "Simpan Barang"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
