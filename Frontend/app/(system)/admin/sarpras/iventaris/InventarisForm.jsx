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
  getRuangan,
  updateAset,
} from "@/services/sarpras.service";

import { KONDISI_OPTIONS, extractData } from "./_utils";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

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
  jumlah: "0",
  jumlahStok: "0",
  stokMinimum: "0",
  ruanganId: "",
  keterangan: "",
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
          <p className="mt-1 text-[11px] theme-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default function InventarisForm({
  mode = "tambah",
  id = "",
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState(emptyForm);

  const [kategori, setKategori] = useState([]);
  const [gudangList, setGudangList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);

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
        const requests = [
          getKategoriAset(),
          getGudang(),
          getRuangan(),
        ];

        if (isEdit) {
          requests.push(getAsetById(id));
        }

        const responses = await Promise.all(requests);

        if (!aktif) return;

        const kategoriData = extractData(responses[0]);
        const gudangData = extractData(responses[1]);
        const ruanganData = extractData(responses[2]);

        setKategori(
          Array.isArray(kategoriData) ? kategoriData : []
        );

        setGudangList(
          Array.isArray(gudangData) ? gudangData : []
        );

        setRuanganList(
          Array.isArray(ruanganData) ? ruanganData : []
        );

        if (isEdit) {
          const asetData = extractData(responses[3]);

          const aset = Array.isArray(asetData)
            ? asetData[0]
            : asetData;

          if (!aset?.id) {
            throw new Error("Data inventaris tidak ditemukan.");
          }

          setForm({
            kode: aset.kode ?? "",
            nama: aset.nama ?? "",

            kategoriAsetId: String(
              aset.kategoriAsetId ??
              aset.kategoriAset?.id ??
              ""
            ),

            gudangId: String(
              aset.gudangId ??
              aset.gudang?.id ??
              ""
            ),

            kondisi: String(
              aset.kondisi ?? "baik"
            ).toLowerCase(),

            jumlah: String(aset.jumlah ?? 0),

            jumlahStok: String(
              aset.jumlahStok ?? aset.jumlah ?? 0
            ),

            stokMinimum: String(
              aset.stokMinimum ?? 0
            ),

            ruanganId: String(
              aset.ruanganId ??
              aset.ruangan?.id ??
              ""
            ),

            keterangan: aset.keterangan ?? "",
          });
        }
      } catch (err) {
        if (aktif) {
          setError(
            err?.message || "Gagal memuat data inventaris."
          );
        }
      } finally {
        if (aktif) {
          setLoading(false);
        }
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

    if (!form.kode.trim()) {
      errors.kode = "Kode barang wajib diisi.";
    } else if (form.kode.trim().length > 50) {
      errors.kode = "Kode barang maksimal 50 karakter.";
    }

    if (!form.nama.trim()) {
      errors.nama = "Nama barang wajib diisi.";
    } else if (form.nama.trim().length > 150) {
      errors.nama = "Nama barang maksimal 150 karakter.";
    }

    if (!form.kategoriAsetId) {
      errors.kategoriAsetId = "Kategori aset wajib dipilih.";
    }

    if (!form.gudangId) {
      errors.gudangId = "Gudang wajib dipilih.";
    }

    const jumlah = Number(form.jumlah);
    const jumlahStok = Number(form.jumlahStok);
    const stokMinimum = Number(form.stokMinimum);

    if (
      form.jumlah === "" ||
      !Number.isInteger(jumlah) ||
      jumlah < 0
    ) {
      errors.jumlah =
        "Jumlah harus berupa bilangan bulat minimal 0.";
    }

    if (
      form.jumlahStok === "" ||
      !Number.isInteger(jumlahStok) ||
      jumlahStok < 0
    ) {
      errors.jumlahStok =
        "Jumlah stok harus berupa bilangan bulat minimal 0.";
    } else if (
      Number.isInteger(jumlah) &&
      jumlahStok > jumlah
    ) {
      errors.jumlahStok =
        "Jumlah stok tidak boleh melebihi jumlah unit.";
    }

    if (
      form.stokMinimum === "" ||
      !Number.isInteger(stokMinimum) ||
      stokMinimum < 0
    ) {
      errors.stokMinimum =
        "Stok minimum harus berupa bilangan bulat minimal 0.";
    }

    if (form.keterangan.trim().length > 255) {
      errors.keterangan =
        "Keterangan maksimal 255 karakter.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving || !validate()) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const payload = {
        kode: form.kode.trim(),
        nama: form.nama.trim(),

        kategoriAsetId: form.kategoriAsetId,
        gudangId: form.gudangId,

        kondisi: form.kondisi || null,

        jumlah: Number(form.jumlah),
        jumlahStok: Number(form.jumlahStok),
        stokMinimum: Number(form.stokMinimum),

        ruanganId: form.ruanganId || null,

        keterangan: form.keterangan.trim() || null,
      };

      const response = isEdit
        ? await updateAset(id, payload)
        : await createAset(payload);

      if (response?.success === false) {
        throw new Error(
          response.message ||
          "Gagal menyimpan data inventaris."
        );
      }

      setSaved(true);

      const nextId =
        response?.data?.id ||
        (isEdit ? id : "");

      setTimeout(() => {
        router.push(
          nextId
            ? `/admin/sarpras/iventaris/${encodeURIComponent(nextId)}`
            : "/admin/sarpras/iventaris"
        );

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
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((value) => !value)}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setSidebarOpen((value) => !value)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 px-4 py-6 sm:px-6 lg:px-8">
            <div>
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/sarpras/iventaris")
                }
                className="theme-text-muted mb-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={14} />
                Kembali ke Inventaris
              </button>

              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-primary)]">
                Sarana &amp; Prasarana
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight theme-text sm:text-2xl lg:text-[28px]">
                {isEdit ? "Edit Inventaris" : "Tambah Inventaris"}
              </h1>

              <p className="mt-1 text-sm theme-text-secondary">
                {isEdit
                  ? "Perbarui informasi barang inventaris."
                  : "Lengkapi informasi barang inventaris yang akan ditambahkan."}
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
                          router.push("/admin/sarpras/gudang/master/tambah")
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
                  <div className="space-y-6 p-4 sm:p-5">
                    <div>
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold theme-text">
                          Informasi Barang
                        </h2>

                        <p className="mt-1 text-xs theme-text-muted">
                          Masukkan identitas dan kategori barang inventaris.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                              maxLength={150}
                              placeholder="Contoh: Laptop Lenovo"
                              className={`${inputClass} pl-10 pr-4`}
                            />
                          </div>
                        </Field>

                        <Field
                          label="Kategori Aset"
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
                              <option value="">
                                Pilih kategori
                              </option>

                              {kategori.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
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
                      </div>
                    </div>

                    <div className={`border-t ${themeDivider}`} />

                    <div>
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold theme-text">
                          Penempatan Barang
                        </h2>

                        <p className="mt-1 text-xs theme-text-muted">
                          Tentukan gudang dan lokasi penyimpanan barang.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                updateField(
                                  "gudangId",
                                  event.target.value
                                )
                              }
                              disabled={formBlocked}
                              className={`${inputClass} appearance-none pl-10 pr-9`}
                            >
                              <option value="">
                                Pilih gudang
                              </option>

                              {gudangList.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
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
                          label="Ruangan"
                          hint="Opsional. Pilih ruangan tempat aset disimpan."
                        >
                          <div className="relative">
                            <MapPin
                              size={16}
                              className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                            />

                            <select
                              value={form.ruanganId}
                              onChange={(event) =>
                                updateField(
                                  "ruanganId",
                                  event.target.value
                                )
                              }
                              className={`${inputClass} appearance-none pl-10 pr-9`}
                            >
                              <option value="">
                                Tidak ada ruangan
                              </option>

                              {ruanganList.map((item) => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                >
                                  {item.nama}
                                  {item.lokasi
                                    ? ` - ${item.lokasi}`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            <ChevronDown
                              size={15}
                              className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                            />
                          </div>
                        </Field>

                        <Field label="Kondisi Barang">
                          <select
                            value={form.kondisi}
                            onChange={(event) =>
                              updateField(
                                "kondisi",
                                event.target.value
                              )
                            }
                            className={`${inputClass} px-4`}
                          >
                            {KONDISI_OPTIONS.map((item) => (
                              <option
                                key={item.value}
                                value={item.value}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>

                    <div className={`border-t ${themeDivider}`} />

                    <div>
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold theme-text">
                          Jumlah dan Stok Barang
                        </h2>

                        <p className="mt-1 text-xs theme-text-muted">
                          Tentukan jumlah keseluruhan, stok tersedia, dan batas minimum stok.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                          label="Jumlah Unit"
                          error={fieldErrors.jumlah}
                          hint="Total seluruh unit barang."
                        >
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.jumlah}
                            onChange={(event) =>
                              updateField("jumlah", event.target.value)
                            }
                            className={`${inputClass} px-4`}
                          />
                        </Field>

                        <Field
                          label="Jumlah Stok Tersedia"
                          error={fieldErrors.jumlahStok}
                          hint="Jumlah unit yang masih tersedia."
                        >
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.jumlahStok}
                            onChange={(event) =>
                              updateField(
                                "jumlahStok",
                                event.target.value
                              )
                            }
                            className={`${inputClass} px-4`}
                          />
                        </Field>

                        <Field
                          label="Stok Minimum"
                          error={fieldErrors.stokMinimum}
                          hint="Batas minimum stok barang."
                        >
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.stokMinimum}
                            onChange={(event) =>
                              updateField(
                                "stokMinimum",
                                event.target.value
                              )
                            }
                            className={`${inputClass} px-4`}
                          />
                        </Field>
                      </div>
                    </div>

                    <div className={`border-t ${themeDivider}`} />

                    <div>
                      <div className="mb-4">
                        <h2 className="text-sm font-semibold theme-text">
                          Keterangan Barang
                        </h2>

                        <p className="mt-1 text-xs theme-text-muted">
                          Tambahkan informasi tambahan mengenai barang.
                        </p>
                      </div>

                      <Field
                        label="Keterangan"
                        error={fieldErrors.keterangan}
                        hint="Opsional, maksimal 255 karakter."
                      >
                        <textarea
                          value={form.keterangan}
                          onChange={(event) =>
                            updateField(
                              "keterangan",
                              event.target.value
                            )
                          }
                          maxLength={255}
                          rows={3}
                          placeholder="Tambahkan keterangan barang inventaris..."
                          className={`${inputClass} resize-y px-4`}
                        />
                      </Field>
                    </div>
                  </div>

                  <div
                    className={`flex flex-col-reverse gap-2.5 border-t ${themeDivider} ${themeNeutralSurface} px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-5`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/sarpras/iventaris")
                      }
                      className="w-full rounded-xl px-4 py-2.5 text-sm font-medium theme-text-secondary transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] sm:w-auto"
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
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
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