"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  Globe,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  School,
} from "lucide-react";

import { getPlatformSekolahDetail } from "@/services/platform.service";

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    fallback
  );
}

function formatDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditSekolahPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDetail = useCallback(async () => {
    if (!id) {
      setError("ID sekolah tidak valid.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getPlatformSekolahDetail(String(id));
      setSchool(res?.data ?? res ?? null);
    } catch (err) {
      setSchool(null);
      setError(getErrorMessage(err, "Gagal memuat detail sekolah dari server."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadDetail();
    });
  }, [loadDetail]);

  if (loading) {
    return (
      <div className="theme-page theme-text flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[var(--color-primary)]"
          />
          <p className="theme-text-muted mt-3 text-xs">
            Memuat data sekolah dari API platform...
          </p>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="theme-page theme-text flex min-h-screen items-center justify-center px-4">
        <div className="theme-card theme-border max-w-md rounded-2xl border p-6 text-center">
          <School
            size={32}
            className="mx-auto mb-3 text-[var(--color-text-muted)]"
          />
          <h2 className="theme-text text-lg font-bold">
            Sekolah Tidak Ditemukan
          </h2>
          <p className="theme-text-muted mt-1 text-xs">
            {error || "Data sekolah yang diminta tidak tersedia pada server."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={loadDetail}
              className="theme-border inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold"
            >
              <RefreshCw size={13} />
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => router.push("/super-admin/sekolah")}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const latestSub = Array.isArray(school.langgananSekolah)
    ? school.langgananSekolah[0]
    : null;

  return (
    <div className="theme-page theme-text min-h-full w-full">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/super-admin/sekolah")}
              className="theme-text-muted mb-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={14} />
              Kembali ke Daftar Sekolah
            </button>
            <h1 className="theme-text flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <School size={20} className="text-[var(--color-primary)]" />
              Detail & Edit Sekolah: {school.nama}
            </h1>
          </div>

          <button
            type="button"
            onClick={loadDetail}
            className="theme-card theme-border inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold"
          >
            <RefreshCw size={13} />
            Muat Ulang Data Server
          </button>
        </div>

        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4 text-xs">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-[var(--color-warning)]"
          />
          <div>
            <p className="theme-text font-bold">
              Mode Read-Only (Backend Endpoint Pembaruan Sekolah Belum Tersedia)
            </p>
            <p className="theme-text-secondary mt-0.5 leading-relaxed">
              Data sekolah di bawah ini diambil langsung dari endpoint resmi{" "}
              <code>GET /api/platform/sekolah/{school.id}</code>. Operasi ubah data
              sekolah dari panel Super Admin (<code>PUT /api/platform/sekolah/:id</code>)
              belum disediakan di Backend sehingga form disimpan dalam mode baca-saja.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="theme-card theme-border rounded-xl border p-5">
            <h2 className="theme-text mb-4 flex items-center gap-2 text-sm font-bold">
              <School size={16} className="text-[var(--color-primary)]" />
              Identitas Sekolah
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div>
                <label className="theme-text-muted mb-1 block font-semibold">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.nama || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <Hash size={12} />
                  NPSN / Kode Sekolah
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.npsn || school.kode || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 block font-semibold">
                  Jenjang
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.jenjang || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <Globe size={12} />
                  Subdomain
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.subdomain || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <Mail size={12} />
                  Email Resmi
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.email || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <Phone size={12} />
                  Telepon
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.telepon || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <MapPin size={12} />
                  Alamat
                </label>
                <textarea
                  rows={2}
                  readOnly
                  value={school.alamat || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>
            </div>
          </section>

          <section className="theme-card theme-border rounded-xl border p-5">
            <h2 className="theme-text mb-4 flex items-center gap-2 text-sm font-bold">
              <Building size={16} className="text-[var(--color-info)]" />
              Yayasan & Langganan Aktif
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div>
                <label className="theme-text-muted mb-1 block font-semibold">
                  Naungan Yayasan
                </label>
                <input
                  type="text"
                  readOnly
                  value={school.yayasan?.nama || "Mandiri / Tanpa Yayasan"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 block font-semibold">
                  Paket Langganan
                </label>
                <input
                  type="text"
                  readOnly
                  value={latestSub?.paket?.nama || "-"}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <FileText size={12} />
                  Status Sekolah / Langganan
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${school.status || "-"} (${
                    latestSub?.statusLangganan || "tanpa langganan"
                  })`}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <Calendar size={12} />
                  Tanggal Mulai Langganan
                </label>
                <input
                  type="date"
                  readOnly
                  value={formatDateInput(latestSub?.tanggalMulai)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>

              <div>
                <label className="theme-text-muted mb-1 flex items-center gap-1 font-semibold">
                  <Calendar size={12} />
                  Tanggal Berakhir Langganan
                </label>
                <input
                  type="date"
                  readOnly
                  value={formatDateInput(latestSub?.tanggalBerakhir)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2 opacity-85"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
