"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  Save,
} from "lucide-react";

import {
  createGelombangPpdb,
  getGelombangPpdbById,
  updateGelombangPpdb,
} from "@/services/gelombangPpdb.service";
import { getJalurPpdb } from "@/services/jalurPpdb.service";

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
      return;
    }

    try {
      setLoading(true);
      setError("");

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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat gelombang."
      );
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

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 lg:p-8">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/spmb/gelombang")
              }
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={15} />
              Kembali ke Gelombang
            </button>

            <div className="mb-6 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <CalendarDays size={21} />
              </div>

              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  {modeEdit
                    ? "Edit Gelombang"
                    : "Tambah Gelombang"}
                </h1>

                <p className="theme-text-secondary mt-1 text-sm leading-6">
                  Kelola nama, tanggal periode, dan kuota gelombang pendaftaran PPDB.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 theme-danger"
                />

                <p className="text-xs theme-danger">
                  {error}
                </p>
              </div>
            )}

            <form
              onSubmit={simpan}
              className={`theme-card ${themeNeutralBorder} overflow-hidden rounded-2xl border ${themeCardShadow}`}
            >
              {loading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <Loader2
                      size={26}
                      className={`${themePrimaryText} mx-auto animate-spin`}
                    />

                    <p className="theme-text-muted mt-3 text-xs font-medium">
                      Memuat gelombang...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-5 sm:p-6">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                      Nama Gelombang
                    </span>

                    <input
                      value={form.nama}
                      onChange={(event) =>
                        ubah("nama", event.target.value)
                      }
                      required
                      maxLength={100}
                      placeholder="Contoh: Gelombang 1"
                      className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                      Jalur (opsional)
                    </span>

                    <select
                      value={form.jalurPpdbId}
                      onChange={(event) =>
                        ubah(
                          "jalurPpdbId",
                          event.target.value
                        )
                      }
                      className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                    >
                      <option value="">
                        Semua jalur sekolah
                      </option>

                      {jalurList.map((jalur) => (
                        <option
                          key={jalur.id}
                          value={jalur.id}
                        >
                          {jalur.nama}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                        Tanggal Mulai
                      </span>

                      <input
                        type="date"
                        value={form.tanggalMulai}
                        onChange={(event) =>
                          ubah(
                            "tanggalMulai",
                            event.target.value
                          )
                        }
                        required
                        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                        Tanggal Selesai
                      </span>

                      <input
                        type="date"
                        value={form.tanggalSelesai}
                        onChange={(event) =>
                          ubah(
                            "tanggalSelesai",
                            event.target.value
                          )
                        }
                        required
                        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                        Kuota (opsional)
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.kuota}
                        onChange={(event) =>
                          ubah(
                            "kuota",
                            event.target.value
                          )
                        }
                        placeholder="Kosongkan bila tidak dibatasi"
                        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                        Status
                      </span>

                      <select
                        value={form.status}
                        onChange={(event) =>
                          ubah(
                            "status",
                            event.target.value
                          )
                        }
                        className={`theme-input theme-text theme-neutral-border h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                      >
                        <option value="aktif">
                          Aktif
                        </option>
                        <option value="nonaktif">
                          Nonaktif
                        </option>
                      </select>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/spmb/gelombang"
                        )
                      }
                      className={`theme-neutral-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]`}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className={`${themePrimaryGradient} inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {saving ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={15} />
                      )}

                      {saving
                        ? "Menyimpan..."
                        : "Simpan Gelombang"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
