"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  Hash,
  Loader2,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import {
  getPengaturanSpmb,
  updatePengaturanSpmb,
} from "@/services/ppdb.service";

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

const DEFAULT_FORM = {
  statusPenerimaan: "buka",
  prefixNomorPendaftaran: "PPDB",
  verifikasiBerkasWajib: false,
};

export default function PengaturanSpmbPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPengaturan = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getPengaturanSpmb();

      setForm({
        statusPenerimaan:
          response?.data?.statusPenerimaan === "tutup"
            ? "tutup"
            : "buka",
        prefixNomorPendaftaran:
          response?.data?.prefixNomorPendaftaran || "PPDB",
        verifikasiBerkasWajib:
          Boolean(
            response?.data?.verifikasiBerkasWajib
          ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat pengaturan SPMB."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Memuat pengaturan dari API saat halaman dibuka.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPengaturan();
  }, [loadPengaturan]);

  async function simpan(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updatePengaturanSpmb({
        statusPenerimaan: form.statusPenerimaan,
        prefixNomorPendaftaran:
          form.prefixNomorPendaftaran,
        verifikasiBerkasWajib:
          form.verifikasiBerkasWajib,
      });

      setForm({
        statusPenerimaan:
          response?.data?.statusPenerimaan === "tutup"
            ? "tutup"
            : "buka",
        prefixNomorPendaftaran:
          response?.data?.prefixNomorPendaftaran || "PPDB",
        verifikasiBerkasWajib:
          Boolean(
            response?.data?.verifikasiBerkasWajib
          ),
      });

      setSuccess(
        response?.message ||
          "Pengaturan SPMB berhasil disimpan."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pengaturan SPMB."
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
          <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 lg:p-8">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/spmb")
              }
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={15} />
              Kembali ke SPMB
            </button>

            <div className="mb-6 flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <Settings2 size={21} />
              </div>

              <div>
                <h1 className="theme-text text-xl font-bold sm:text-2xl">
                  Pengaturan SPMB
                </h1>

                <p className="theme-text-secondary mt-1 text-sm leading-6">
                  Konfigurasi disimpan ke tabel{" "}
                  <code>pengaturan_sistem</code> milik
                  sekolah Anda melalui{" "}
                  <code>GET/POST /api/pengaturan</code>.
                  Status integrasi: penyimpanan tersedia,
                  tetapi alur PPDB/SPMB di Backend belum
                  membaca kunci-kunci ini.
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] px-4 py-3">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-[var(--color-warning)]"
              />

              <div>
                <p className="text-xs font-semibold theme-text">
                  Pengaturan belum diterapkan oleh alur PPDB
                </p>

                <p className="mt-0.5 text-xs leading-5 theme-text-secondary">
                  Kunci <code>spmb_status_penerimaan</code>,{" "}
                  <code>spmb_prefix_nomor_pendaftaran</code>, dan{" "}
                  <code>spmb_verifikasi_berkas_wajib</code>{" "}
                  tersimpan, tetapi controller PPDB di Backend
                  saat ini belum membacanya. Perubahan di
                  halaman ini tidak menutup pendaftaran,
                  tidak mengubah prefix nomor, dan tidak
                  memblokir kelulusan secara otomatis.
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

            {success && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-4 py-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />

                <p className="text-xs text-[var(--color-success)]">
                  {success}
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
                      Memuat pengaturan SPMB...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                  {/* STATUS PENERIMAAN */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <ShieldCheck size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text text-sm font-bold">
                          Status Penerimaan
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Nilai ini hanya tersimpan sebagai
                          konfigurasi. Backend PPDB saat ini
                          belum membaca kunci ini, sehingga{" "}
                          <code>POST /api/ppdb/daftar</code>{" "}
                          tidak otomatis menolak pendaftaran
                          ketika dipilih &quot;Tutup&quot;.
                        </p>

                        <select
                          value={form.statusPenerimaan}
                          onChange={(event) =>
                            setForm((value) => ({
                              ...value,
                              statusPenerimaan:
                                event.target.value,
                            }))
                          }
                          className={`theme-input theme-text theme-neutral-border mt-3 h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs outline-none transition ${themeFocus}`}
                        >
                          <option value="buka">
                            Buka — pendaftaran diterima
                          </option>
                          <option value="tutup">
                            Tutup — pendaftaran ditolak
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PREFIX NOMOR */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <Hash size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text text-sm font-bold">
                          Prefix Nomor Pendaftaran
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Nilai ini belum dipakai generator
                          nomor pendaftaran Backend. Saat ini
                          nomor selalu dibuat dengan format{" "}
                          <code>PPDB-TAHUN-NOMOR</code>.
                          Maksimal 5 karakter.
                        </p>

                        <input
                          value={
                            form.prefixNomorPendaftaran
                          }
                          onChange={(event) =>
                            setForm((value) => ({
                              ...value,
                              prefixNomorPendaftaran:
                                event.target.value
                                  .toUpperCase()
                                  .replace(
                                    /[^A-Z0-9-]/g,
                                    ""
                                  )
                                  .slice(0, 5),
                            }))
                          }
                          maxLength={5}
                          required
                          placeholder="PPDB"
                          className={`theme-input theme-text theme-neutral-border mt-3 h-10 w-full rounded-lg border ${themeNeutralSurface} px-3 text-xs uppercase outline-none transition ${themeFocus}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* VERIFIKASI BERKAS */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                      >
                        <FileCheck2 size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="theme-text text-sm font-bold">
                          Verifikasi Berkas Wajib
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs leading-5">
                          Nilai ini belum ditegakkan oleh
                          endpoint verifikasi Backend.{" "}
                          <code>PATCH /api/ppdb/:id/verifikasi</code>{" "}
                          saat ini tidak memeriksa KK, AKTE,
                          atau IJAZAH sebelum meluluskan
                          pendaftar.
                        </p>

                        <label className="mt-3 flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={
                              form.verifikasiBerkasWajib
                            }
                            onChange={(event) =>
                              setForm((value) => ({
                                ...value,
                                verifikasiBerkasWajib:
                                  event.target.checked,
                              }))
                            }
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />

                          <span className="theme-text-secondary text-xs">
                            Wajibkan tiga berkas sebelum
                            kelulusan
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${themeNeutralSurface} flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}
                  >
                    <p className="theme-text-muted text-[11px] leading-4">
                      Tidak ada penyimpanan di localStorage.
                      Perubahan baru berlaku setelah tombol
                      simpan ditekan.
                    </p>

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
                        : "Simpan Pengaturan"}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div
              className={`${themeNeutralBorder} mt-5 rounded-xl border ${themeNeutralSurface} p-4`}
            >
              <p className="theme-text-secondary text-xs leading-5">
                Endpoint:{" "}
                <code>GET /api/pengaturan</code> dan{" "}
                <code>POST /api/pengaturan</code> (bukan
                <code> /api/ppdb/pengaturan</code>). Nilai
                disimpan per <code>sekolahId</code> dari
                sesi admin, sehingga tidak dapat menimpa
                pengaturan sekolah lain. Penyimpanan
                berhasil tidak berarti alur PPDB sudah
                memakai nilai tersebut.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
