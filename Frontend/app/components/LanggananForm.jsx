"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { getPlatformSekolah } from "@/services/platform.service";
import { getPaket } from "@/services/paket.service";

export default function LanggananForm({
  mode = "create",
  initialData = null,
  onSubmit = null,
}) {
  const [sekolahList, setSekolahList] = useState([]);
  const [paketList, setPaketList] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sekolahId: initialData?.sekolahId || initialData?.sekolah?.id || "",
    paketId: initialData?.paketId || initialData?.paket?.id || "",
    statusLangganan: initialData?.statusLangganan || "aktif",
    tanggalMulai: initialData?.tanggalMulai
      ? String(initialData.tanggalMulai).slice(0, 10)
      : "",
    tanggalBerakhir: initialData?.tanggalBerakhir
      ? String(initialData.tanggalBerakhir).slice(0, 10)
      : "",
  });

  useEffect(() => {
    let active = true;
    async function loadMaster() {
      try {
        setLoadingMaster(true);
        const [sekolahRes, paketRes] = await Promise.allSettled([
          getPlatformSekolah({ page: 1, limit: 100 }),
          getPaket(),
        ]);

        if (!active) return;

        if (sekolahRes.status === "fulfilled") {
          const list = Array.isArray(sekolahRes.value?.data)
            ? sekolahRes.value.data
            : [];
          setSekolahList(list);
        }

        if (paketRes.status === "fulfilled") {
          const raw = paketRes.value;
          const list = Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw)
            ? raw
            : [];
          setPaketList(list);
        }
      } finally {
        if (active) setLoadingMaster(false);
      }
    }

    loadMaster();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice("");
    setError("");

    if (typeof onSubmit === "function") {
      try {
        await onSubmit(formData);
        setNotice("Data langganan berhasil diproses.");
      } catch (err) {
        setError(err?.message || "Gagal memproses data langganan.");
      }
      return;
    }

    setError(
      mode === "edit"
        ? "Endpoint pembaruan langganan sekolah oleh Super Admin belum tersedia di Backend (PUT /api/langganan/sekolah/:id)."
        : "Pembuatan langganan sekolah dilakukan melalui alur upgrade/perpanjang paket tenant pada Backend (/api/langganan/upgrade atau /api/langganan/renew)."
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4 text-xs">
        <AlertCircle
          size={16}
          className="mt-0.5 shrink-0 text-[var(--color-warning)]"
        />
        <div>
          <p className="theme-text font-semibold">
            {mode === "edit"
              ? "Pembaruan Langganan Terbatas di Backend"
              : "Data Referensi Langsung dari API Platform"}
          </p>
          <p className="theme-text-muted mt-0.5 leading-relaxed">
            Daftar sekolah dan paket di bawah dimuat dari server. Endpoint update langsung
            langganan sekolah oleh Super Admin belum tersedia pada API Backend.
          </p>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-success)]">
          <CheckCircle2 size={15} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {loadingMaster ? (
        <div className="flex items-center gap-2 py-6 text-xs theme-text-muted">
          <Loader2 size={16} className="animate-spin" />
          Memuat daftar sekolah dan paket langganan...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <label className="theme-text mb-1.5 block font-semibold">
              Sekolah
            </label>
            <select
              name="sekolahId"
              value={formData.sekolahId}
              onChange={handleChange}
              className="theme-input theme-text w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">-- Pilih Sekolah --</option>
              {sekolahList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} {s.subdomain ? `(${s.subdomain})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="theme-text mb-1.5 block font-semibold">
              Paket Langganan
            </label>
            <select
              name="paketId"
              value={formData.paketId}
              onChange={handleChange}
              className="theme-input theme-text w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">-- Pilih Paket --</option>
              {paketList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="theme-text mb-1.5 block font-semibold">
              Status Langganan
            </label>
            <select
              name="statusLangganan"
              value={formData.statusLangganan}
              onChange={handleChange}
              className="theme-input theme-text w-full rounded-lg border px-3 py-2.5"
            >
              <option value="aktif">Aktif</option>
              <option value="trial">Trial</option>
              <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
              <option value="kedaluwarsa">Kedaluwarsa</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="theme-text mb-1.5 block font-semibold">
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="tanggalMulai"
                value={formData.tanggalMulai}
                onChange={handleChange}
                className="theme-input theme-text w-full rounded-lg border px-3 py-2.5"
              />
            </div>

            <div>
              <label className="theme-text mb-1.5 block font-semibold">
                Tanggal Berakhir
              </label>
              <input
                type="date"
                name="tanggalBerakhir"
                value={formData.tanggalBerakhir}
                onChange={handleChange}
                className="theme-input theme-text w-full rounded-lg border px-3 py-2.5"
              />
            </div>
          </div>
        </div>
      )}

      {typeof onSubmit === "function" && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-95"
          >
            {mode === "edit" ? "Simpan Perubahan" : "Simpan Langganan"}
          </button>
        </div>
      )}
    </form>
  );
}
