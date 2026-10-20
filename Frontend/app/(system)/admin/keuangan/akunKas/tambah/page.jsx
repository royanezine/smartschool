"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

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

export default function TambahAkunKasPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.kode.trim() || !form.nama.trim()) {
      setError("Kode dan nama akun wajib diisi.");
      return;
    }

    const saldoAwal = Number(form.saldoAwal);

    if (!Number.isFinite(saldoAwal) || saldoAwal < 0) {
      setError("Saldo awal harus berupa angka nol atau lebih.");
      return;
    }

    const payload = {
      kode: form.kode.trim(),
      nama: form.nama.trim(),
      tipe: form.tipe,
      saldoAwal,
      status: form.status,
    };

    setSaving(true);

    try {
      const response = await apiFetch("/api/keuangan/akun-kas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response?.success === false) {
        throw new Error(response.message || "Gagal menyimpan akun kas.");
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">

              {/* HEADER PAGE */}
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
                        Tambah Akun Kas
                      </h1>
                    </div>
                  </div>

                  <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-6">
                    Isi informasi akun kas atau bank baru untuk pencatatan
                    transaksi keuangan sekolah.
                  </p>
                </div>
              </section>

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)] p-4 text-sm">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold theme-text">Terjadi masalah</p>
                    <p className="mt-1 break-words theme-text-secondary">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    aria-label="Tutup pesan"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* FORM */}
              <section className="theme-card rounded-2xl border shadow-sm">
                <div className="theme-border border-b px-5 py-4 sm:px-6">
                  <h2 className="theme-text text-sm font-bold">
                    Informasi Akun
                  </h2>
                  <p className="theme-text-muted mt-1 text-xs">
                    Semua kolom bertanda * wajib diisi.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="kode"
                        className="theme-text mb-1.5 block text-sm font-semibold"
                      >
                        Kode Akun *
                      </label>
                      <input
                        id="kode"
                        value={form.kode}
                        onChange={(event) =>
                          updateForm("kode", event.target.value)
                        }
                        required
                        maxLength={50}
                        placeholder="Contoh: KAS-001"
                        className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none"
                      />
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
                        placeholder="Contoh: Kas Utama"
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
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="saldoAwal"
                        className="theme-text mb-1.5 block text-sm font-semibold"
                      >
                        Saldo Awal (Rp) *
                      </label>
                      <input
                        id="saldoAwal"
                        type="number"
                        min="0"
                        step="1"
                        value={form.saldoAwal}
                        onChange={(event) =>
                          updateForm("saldoAwal", event.target.value)
                        }
                        required
                        className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="theme-card-soft theme-border flex items-start gap-3 rounded-xl border p-4">
                    <Info
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-info)]"
                    />
                    <p className="theme-text-secondary text-xs leading-5">
                      Pastikan kode akun belum pernah digunakan. Saldo awal
                      akan menjadi saldo pembukaan akun ini.
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
                      disabled={saving}
                      className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Save size={15} />
                      )}
                      {saving ? "Menyimpan..." : "Simpan Akun"}
                    </button>
                  </div>
                </form>
              </section>

              <div className="h-8" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}