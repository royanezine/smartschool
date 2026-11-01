"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  School,
  ArrowLeft,
  Building2,
  Package,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { createSekolahBinaan } from "@/services/yayasan.service";
import { getPaket } from "@/services/paket.service";

const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK"];

export default function TambahSekolahCabangPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: "",
    jenjang: "SMA",
    kode: "",
    npsn: "",
    subdomain: "",
    paketId: "",
    alamat: "",
    telepon: "",
    email: "",
  });

  const [paketList, setPaketList] = useState([]);
  const [loadingPaket, setLoadingPaket] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPaket() {
      try {
        setLoadingPaket(true);
        const res = await getPaket();
        const list = Array.isArray(res?.data) ? res.data : [];
        // Saring paket bertipe SEKOLAH
        const filtered = list.filter(
          (p) => !p.tipe || String(p.tipe).toUpperCase() === "SEKOLAH"
        );
        setPaketList(filtered);
        if (filtered.length > 0) {
          setFormData((prev) => ({ ...prev, paketId: filtered[0].id }));
        }
      } catch (err) {
        console.error("Gagal memuat paket:", err);
      } finally {
        setLoadingPaket(false);
      }
    }
    loadPaket();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "subdomain") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      }));
    } else if (name === "kode") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi dasar FE sebelum kirim
    if (!formData.nama.trim()) {
      setError("Nama sekolah wajib diisi.");
      return;
    }
    if (!formData.kode.trim()) {
      setError("Kode sekolah wajib diisi.");
      return;
    }
    if (!/^\d{8}$/.test(formData.npsn.trim())) {
      setError("NPSN harus tepat 8 digit angka.");
      return;
    }
    if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
      setError("Subdomain minimal 3 karakter huruf kecil/angka.");
      return;
    }
    if (!formData.paketId) {
      setError("Pilih paket langganan untuk sekolah cabang.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nama: formData.nama.trim(),
        jenjang: formData.jenjang,
        kode: formData.kode.trim(),
        npsn: formData.npsn.trim(),
        subdomain: formData.subdomain.trim(),
        paketId: formData.paketId,
        alamat: formData.alamat.trim() || undefined,
        telepon: formData.telepon.trim() || undefined,
        email: formData.email.trim() || undefined,
      };

      const res = await createSekolahBinaan(payload);

      if (res?.success) {
        setSuccessData(res.data);
      } else {
        throw new Error(res?.message || "Gagal membuat sekolah cabang.");
      }
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat mendaftarkan sekolah cabang.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successData?.admin) return;
    const text = `Kredensial Admin Sekolah ${successData.sekolah?.nama || ""}:\nUsername: ${successData.admin.namaPengguna}\nEmail: ${successData.admin.email}\nPassword: ${successData.admin.passwordDefault}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-4xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="w-full space-y-6">
          <Link
            href="/yayasan/sekolah"
            className="inline-flex items-center gap-1.5 text-sm theme-text-secondary transition-colors hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={15} />
            Kembali ke Daftar Sekolah
          </Link>

          {/* Heading */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                Tambah Sekolah Cabang Baru
              </h1>
              <p className="text-sm theme-text-secondary">
                Daftarkan unit sekolah baru di bawah naungan yayasan. Sistem akan otomatis mengonfigurasi akun admin cabang.
              </p>
            </div>
          </div>

          {/* Success View */}
          {successData ? (
            <div className="theme-card rounded-2xl border border-[var(--color-success)]/30 bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)] p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-success)]">
                    Sekolah Cabang Berhasil Didaftarkan!
                  </h2>
                  <p className="mt-1 text-sm theme-text-secondary">
                    Unit <strong>{successData.sekolah?.nama}</strong> telah resmi terhubung dengan yayasan Anda.
                  </p>
                </div>
              </div>

              {/* Admin credentials box */}
              {successData.admin && (
                <div className="rounded-xl border theme-border bg-[var(--color-card)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                        Akun Administrator Cabang
                      </p>
                      <p className="text-xs theme-text-muted">
                        Simpan kredensial berikut dan serahkan kepada admin sekolah yang ditunjuk.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="inline-flex items-center gap-1.5 rounded-lg border theme-border px-3 py-1.5 text-xs font-semibold theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-all"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-[var(--color-success)]" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Salin Kredensial</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
                      <p className="text-xs theme-text-muted">Username</p>
                      <p className="mt-0.5 font-mono font-semibold theme-text truncate">
                        {successData.admin.namaPengguna}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
                      <p className="text-xs theme-text-muted">Email Login</p>
                      <p className="mt-0.5 font-mono font-semibold theme-text truncate">
                        {successData.admin.email}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
                      <p className="text-xs theme-text-muted">Password Default</p>
                      <p className="mt-0.5 font-mono font-semibold text-[var(--color-primary)] truncate">
                        {successData.admin.passwordDefault}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/yayasan/sekolah")}
                  className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                >
                  Kembali ke Daftar Sekolah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setFormData({
                      nama: "",
                      jenjang: "SMA",
                      kode: "",
                      npsn: "",
                      subdomain: "",
                      paketId: paketList[0]?.id || "",
                      alamat: "",
                      telepon: "",
                      email: "",
                    });
                  }}
                  className="rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-all"
                >
                  Tambah Cabang Lainnya
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="theme-card rounded-2xl border theme-border p-6 sm:p-8 space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-warning)]/40 bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4 text-sm text-[var(--color-warning)]">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Pendaftaran Gagal</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Bagian 1: Identitas Sekolah */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  1. Identitas Unit Sekolah
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Nama Resmi Sekolah <span className="text-[var(--color-warning)]">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Contoh: SMA Smart School Jakarta"
                      required
                      className="w-full rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Jenjang Pendidikan <span className="text-[var(--color-warning)]">*</span>
                    </label>
                    <select
                      name="jenjang"
                      value={formData.jenjang}
                      onChange={handleChange}
                      className="w-full rounded-xl border theme-border bg-[var(--color-card)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
                    >
                      {JENJANG_OPTIONS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Kode Unik Sekolah <span className="text-[var(--color-warning)]">*</span>
                    </label>
                    <input
                      type="text"
                      name="kode"
                      value={formData.kode}
                      onChange={handleChange}
                      placeholder="Contoh: SMA-01"
                      required
                      className="w-full rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm theme-text uppercase outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      NPSN (8 Digit Angka) <span className="text-[var(--color-warning)]">*</span>
                    </label>
                    <input
                      type="text"
                      name="npsn"
                      value={formData.npsn}
                      onChange={handleChange}
                      placeholder="Contoh: 12345678"
                      maxLength={8}
                      required
                      className="w-full rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Subdomain Sistem <span className="text-[var(--color-warning)]">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm focus-within:border-[var(--color-primary)] transition-all">
                      <input
                        type="text"
                        name="subdomain"
                        value={formData.subdomain}
                        onChange={handleChange}
                        placeholder="smasmartschool"
                        required
                        className="w-full bg-transparent theme-text outline-none"
                      />
                      <span className="shrink-0 theme-text-muted text-xs font-mono ml-1">
                        .smartschool.id
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Paket Berlangganan */}
              <div className="space-y-4 pt-2 border-t theme-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  2. Paket Berlangganan Cabang
                </h3>

                {loadingPaket ? (
                  <div className="flex items-center gap-2 text-xs theme-text-muted py-2">
                    <Loader2 size={14} className="animate-spin" />
                    Memuat daftar paket berlangganan...
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Pilih Paket Sekolah <span className="text-[var(--color-warning)]">*</span>
                    </label>
                    <select
                      name="paketId"
                      value={formData.paketId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border theme-border bg-[var(--color-card)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
                    >
                      {paketList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} — Rp {Number(p.harga || 0).toLocaleString("id-ID")} ({p.durasi} Hari)
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs theme-text-muted">
                      Paket ini otomatis terhubung dan disubsidi di bawah langganan aktif yayasan Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* Bagian 3: Alamat & Kontak */}
              <div className="space-y-4 pt-2 border-t theme-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  3. Kontak & Lokasi Unit (Opsional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Alamat Lengkap
                    </label>
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Jl. Pendidikan No. 1, Jakarta"
                      className="w-full rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleChange}
                      placeholder="021-12345678"
                      className="w-full rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1">
                      Email Resmi Sekolah
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@sekolah.sch.id"
                      className="w-full rounded-xl border theme-border bg-transparent px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t theme-border">
                <Link
                  href="/yayasan/sekolah"
                  className="rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition-all"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mendaftarkan Cabang...</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={16} />
                      <span>Daftarkan Sekolah Cabang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
