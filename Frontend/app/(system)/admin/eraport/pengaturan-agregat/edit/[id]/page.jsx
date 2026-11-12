"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  Save,
  Loader2,
  CircleCheck,
  CircleAlert,
  BookOpen,
  Info,
  Percent,
} from "lucide-react";

import { getAgregatRapor, updateAgregatRapor } from "@/services/pengaturan.service";
import { getMataPelajaran } from "@/services/mataPelajaran.service";

function getTotalWeight(subject) {
  return (
    Number(subject.tugas) +
    Number(subject.uts) +
    Number(subject.uas) +
    Number(subject.praktik)
  );
}

export default function EditAgregatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const mapelId = params?.id;
  const tahunAjaranId = searchParams.get("tahunAjaranId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [subject, setSubject] = useState({
    id: "",
    mapel: "",
    kategori: "Umum",
    tugas: 25,
    uts: 25,
    uas: 30,
    praktik: 20,
    kkm: 75,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!mapelId || !tahunAjaranId) {
        setErrorMsg("Parameter ID Mapel atau Tahun Ajaran tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");

        // Ambil data master mapel untuk nama
        const mapelRes = await getMataPelajaran();
        const mapelList = Array.isArray(mapelRes?.data) ? mapelRes.data : [];
        const foundMapel = mapelList.find((m) => String(m.id) === String(mapelId));

        if (!foundMapel) {
          throw new Error("Data mata pelajaran tidak ditemukan.");
        }

        // Ambil data agregat yang sudah tersimpan
        const agregatRes = await getAgregatRapor(tahunAjaranId);
        const backendItems = agregatRes?.data?.mataPelajaran || [];
        const savedItem = backendItems.find((item) => String(item.mataPelajaranId) === String(mapelId));

        if (isMounted) {
          setSubject({
            id: foundMapel.id,
            mapel: foundMapel.nama || "Mata Pelajaran",
            kategori: "Umum",
            tugas: savedItem ? Number(savedItem.tugas) : 25,
            uts: savedItem ? Number(savedItem.uts) : 25,
            uas: savedItem ? Number(savedItem.uas) : 30,
            praktik: savedItem ? Number(savedItem.praktik) : 20,
            kkm: savedItem ? Number(savedItem.kkm) : 75,
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat detail:", err);
          setErrorMsg(err?.message || "Gagal memuat detail konfigurasi.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [mapelId, tahunAjaranId]);

  const handleChange = (field, value) => {
    setSubject((prev) => ({ ...prev, [field]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = getTotalWeight(subject);
    if (total !== 100) {
      setErrorMsg(`Total bobot harus tepat 100% (saat ini ${total}%).`);
      return;
    }

    const kkmNum = Number(subject.kkm);
    if (isNaN(kkmNum) || kkmNum < 0 || kkmNum > 100) {
      setErrorMsg("KKM harus berupa angka antara 0 dan 100.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      // Ambil semua subject yang ada (karena updateAgregatRapor butuh full list)
      const agregatRes = await getAgregatRapor(tahunAjaranId);
      const backendItems = agregatRes?.data?.mataPelajaran || [];
      const mapelRes = await getMataPelajaran();
      const mapelList = Array.isArray(mapelRes?.data) ? mapelRes.data : [];

      const fullPayload = mapelList.map((m) => {
        const existing = backendItems.find((item) => String(item.mataPelajaranId) === String(m.id));
        const isEditing = String(m.id) === String(mapelId);

        return {
          mataPelajaranId: m.id,
          tugas: isEditing ? Number(subject.tugas) : (existing ? Number(existing.tugas) : 25),
          uts: isEditing ? Number(subject.uts) : (existing ? Number(existing.uts) : 25),
          uas: isEditing ? Number(subject.uas) : (existing ? Number(existing.uas) : 30),
          praktik: isEditing ? Number(subject.praktik) : (existing ? Number(existing.praktik) : 20),
          kkm: isEditing ? Math.round(Number(subject.kkm)) : (existing ? Math.round(Number(existing.kkm)) : 75),
        };
      });

      await updateAgregatRapor({
        tahunAjaranId,
        mataPelajaran: fullPayload,
      });

      setSuccessMsg("Konfigurasi berhasil disimpan.");
      setTimeout(() => {
        router.push(`/admin/eraport/pengaturan-agregat`);
      }, 1200);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      setErrorMsg(err?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden theme-page theme-text">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0"><Header /></div>
          <main className="flex min-h-0 flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Memuat detail konfigurasi...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0"><Header /></div>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/eraport/pengaturan-agregat"
                  className="p-2 border theme-border rounded-lg theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:theme-text transition"
                  title="Kembali"
                >
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold theme-text tracking-tight">Edit Konfigurasi Agregat</h1>
                  <p className="text-sm theme-text-secondary mt-0.5">Perbarui bobot nilai dan KKM mata pelajaran.</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-800">
                <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
                <p className="flex-1">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-sm text-emerald-800">
                <CircleCheck size={18} className="shrink-0" />
                <p className="flex-1">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
                
                {/* Kolom Kiri: Form Input */}
                <div className="theme-card rounded-xl border p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-10 w-10 items-center justify-center rounded-lg">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold theme-text">{subject.mapel}</p>
                      <p className="text-xs theme-text-secondary">{subject.kategori}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold theme-text-secondary mb-2 block">Bobot Tugas</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subject.tugas}
                          onChange={(e) => handleChange("tugas", e.target.value)}
                          className="theme-input w-full rounded-lg border px-3.5 py-2.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold theme-text-secondary mb-2 block">Bobot UTS</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subject.uts}
                          onChange={(e) => handleChange("uts", e.target.value)}
                          className="theme-input w-full rounded-lg border px-3.5 py-2.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold theme-text-secondary mb-2 block">Bobot UAS</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subject.uas}
                          onChange={(e) => handleChange("uas", e.target.value)}
                          className="theme-input w-full rounded-lg border px-3.5 py-2.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold theme-text-secondary mb-2 block">Bobot Praktik</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subject.praktik}
                          onChange={(e) => handleChange("praktik", e.target.value)}
                          className="theme-input w-full rounded-lg border px-3.5 py-2.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border px-4 py-3 bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                    <div>
                      <p className="text-xs theme-text-muted">Total Bobot</p>
                      <p className={`text-xl font-bold mt-1 ${getTotalWeight(subject) === 100 ? "text-emerald-600" : "text-red-600"}`}>
                        {getTotalWeight(subject)}%
                      </p>
                    </div>
                    {getTotalWeight(subject) === 100 ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CircleCheck size={16} /> Valid</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600"><CircleAlert size={16} /> Harus 100%</span>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold theme-text-secondary mb-2 block">KKM</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subject.kkm}
                      onChange={(e) => handleChange("kkm", e.target.value)}
                      className="theme-input w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                    <Link
                      href="/admin/eraport/pengaturan-agregat"
                      className="px-4 py-2.5 rounded-lg border text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                    >
                      Batal
                    </Link>
                    <button
                      type="submit"
                      disabled={saving || getTotalWeight(subject) !== 100}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>

                {/* Kolom Kanan: Info */}
                <aside className="space-y-5">
                  <section className="rounded-xl border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-5">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="mt-0.5 shrink-0 theme-primary-text" />
                      <div>
                        <h3 className="text-xs font-bold theme-primary-text">Panduan Edit</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-[color-mix(in_srgb,var(--color-info)_80%,var(--color-text))]">
                          Pastikan total bobot (Tugas + UTS + UAS + Praktik) berjumlah tepat 100% sebelum menyimpan.
                        </p>
                      </div>
                    </div>
                  </section>
                </aside>

              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}