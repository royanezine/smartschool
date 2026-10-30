"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Wallet,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Info,
} from "lucide-react";

import { getAkunKas, updateAkunKas } from "@/services/jurnalKas.service";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

const EMPTY_FORM = {
  kode: "",
  nama: "",
  tipe: "kas",
  saldoAwal: "0",
  status: "aktif",
};

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba lagi.";
}

export default function EditAkunKasPage() {
  const router = useRouter();
  const params = useParams();
  const akunId = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!akunId || typeof akunId !== "string") {
      setLoading(false);
      setError("ID akun kas tidak valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAkunKas();

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal mengambil daftar akun kas.",
        );
      }

      const rows = Array.isArray(response?.data)
        ? response.data
        : [];

      const akun = rows.find((item) => item.id === akunId);

      if (!akun) {
        throw new Error(
          "Akun kas tidak ditemukan pada daftar akun sekolah ini.",
        );
      }

      setForm({
        kode: akun.kode ?? "",
        nama: akun.nama ?? "",
        tipe: akun.tipe ?? "kas",
        saldoAwal: String(akun.saldoAwal ?? 0),
        status: akun.status ?? "aktif",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [akunId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDetail();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDetail]);

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!akunId || typeof akunId !== "string") {
      setError("ID akun kas tidak valid.");
      return;
    }

    if (!form.nama.trim()) {
      setError("Nama akun wajib diisi.");
      return;
    }

    const payload = {
      nama: form.nama.trim(),
      tipe: form.tipe,
      status: form.status,
    };

    setSaving(true);

    try {
      const response = await updateAkunKas(
        akunId,
        payload,
      );

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal memperbarui akun kas.",
        );
      }

      router.push("/admin/keuangan/akunKas");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="akunKas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed((previous) => !previous)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
              <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Link
                    href="/admin/keuangan/akunKas"
                    className="theme-text-muted mb-3 inline-flex items-center gap-2 text-xs font-semibold hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={14} />
                    Kembali ke Daftar Akun
                  </Link>

                  <div className="flex items-center gap-3">
                    <div className="theme-info flex h-12 w-12 items-center justify-center rounded-xl border">
                      <Wallet size={23} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                        KEUANGAN SEKOLAH
                      </p>

                      <h1 className="theme-text mt-0.5 text-[25px] font-bold tracking-tight sm:text-[29px]">
                        Edit Akun Kas
                      </h1>
                    </div>
                  </div>

                  <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-6">
                    Perbarui nama, jenis, dan status akun kas atau bank sekolah.
                  </p>
                </div>
              </section>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)] p-4 text-sm"
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold theme-text">
                      Terjadi masalah
                    </p>
                    <p className="theme-text-secondary mt-1 break-words">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Tutup pesan"
                    className="theme-text-muted"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              <section className="theme-card rounded-2xl border shadow-sm">
                <div className="theme-border border-b px-5 py-4 sm:px-6">
                  <h2 className="theme-text text-sm font-bold">
                    Informasi Akun
                  </h2>
                  <p className="theme-text-muted mt-1 text-xs">
                    Kode akun dan saldo awal ditampilkan sebagai informasi.
                    Backend saat ini tidak memproses perubahan kedua field tersebut.
                  </p>
                </div>

                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2
                        size={26}
                        className="animate-spin text-[var(--color-primary)]"
                      />
                      <p className="theme-text-muted mt-3 text-sm">
                        Memuat data akun...
                      </p>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5 sm:p-6"
                  >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="kode"
                          className="theme-text mb-1.5 block text-sm font-semibold"
                        >
                          Kode Akun
                        </label>

                        <input
                          id="kode"
                          value={form.kode}
                          readOnly
                          className="theme-input h-11 w-full cursor-not-allowed rounded-xl border px-3 text-sm opacity-70 outline-none"
                        />

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Kode akun tidak dapat diubah melalui endpoint update saat ini.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="nama"
                          className="theme-text mb-1.5 block text-sm font-semibold"
                        >
                          Nama Akun *
                        </label>

                        <input
                          id="nama"
                          value={form.nama}
                          onChange={(event) =>
                            updateForm("nama", event.target.value)
                          }
                          required
                          maxLength={150}
                          className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tipe"
                          className="theme-text mb-1.5 block text-sm font-semibold"
                        >
                          Jenis Akun *
                        </label>

                        <select
                          id="tipe"
                          value={form.tipe}
                          onChange={(event) =>
                            updateForm("tipe", event.target.value)
                          }
                          required
                          className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none"
                        >
                          <option value="kas">Kas</option>
                          <option value="bank">Bank</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="status"
                          className="theme-text mb-1.5 block text-sm font-semibold"
                        >
                          Status *
                        </label>

                        <select
                          id="status"
                          value={form.status}
                          onChange={(event) =>
                            updateForm("status", event.target.value)
                          }
                          required
                          className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="tidak_aktif">Tidak Aktif</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label
                          htmlFor="saldoAwal"
                          className="theme-text mb-1.5 block text-sm font-semibold"
                        >
                          Saldo Awal (Rp)
                        </label>

                        <input
                          id="saldoAwal"
                          type="number"
                          min="0"
                          step="1"
                          value={form.saldoAwal}
                          readOnly
                          className="theme-input h-11 w-full cursor-not-allowed rounded-xl border px-3 text-sm opacity-70 outline-none"
                        />

                        <p className="theme-text-muted mt-1.5 text-xs">
                          Saldo awal hanya dapat diperbarui oleh Backend jika akun belum memiliki transaksi.
                        </p>
                      </div>
                    </div>

                    <div className="theme-card-soft theme-border flex items-start gap-3 rounded-xl border p-4">
                      <Info
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--color-info)]"
                      />
                      <p className="theme-text-secondary text-xs leading-5">
                        Perubahan nama, jenis, dan status akan dikirim ke
                        endpoint update akun kas yang tersedia di Backend.
                      </p>
                    </div>

                    <div className="theme-border flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
                      <Link
                        href="/admin/keuangan/akunKas"
                        className="theme-input inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold"
                      >
                        Batal
                      </Link>

                      <button
                        type="submit"
                        disabled={saving || loading}
                        className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Save size={15} />
                        )}
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <div className="h-8" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
