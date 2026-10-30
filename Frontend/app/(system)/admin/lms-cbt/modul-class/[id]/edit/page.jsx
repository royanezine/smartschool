"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  UserCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

import { getKelas } from "@/services/kelas.service";
import { getMataPelajaran } from "@/services/mataPelajaran.service";
import { getUsers } from "@/services/user.service";
import {
  getKelasMapelById,
  updateKelasMapel,
} from "@/services/kelasMapel.service";

export default function EditModulClassPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [guruList, setGuruList] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [kelasId, setKelasId] = useState("");
  const [mataPelajaranId, setMataPelajaranId] = useState("");
  const [guruPengajarId, setGuruPengajarId] = useState("");
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      if (!id) return;
      setLoadingData(true);
      setError(null);

      try {
        const [kelasRes, mapelRes, guruRes, detailRes] =
          await Promise.allSettled([
            getKelas({ limit: 100 }),
            getMataPelajaran(),
            getUsers({ page: 1, limit: 100, role: "guru" }),
            getKelasMapelById(id),
          ]);

        if (isMounted) {
          if (kelasRes.status === "fulfilled") {
            const rawKelas = kelasRes.value?.data || kelasRes.value || [];
            setKelasList(Array.isArray(rawKelas) ? rawKelas : []);
          }

          if (mapelRes.status === "fulfilled") {
            const rawMapel = mapelRes.value?.data || mapelRes.value || [];
            setMapelList(Array.isArray(rawMapel) ? rawMapel : []);
          }

          if (guruRes.status === "fulfilled") {
            const rawGuru = guruRes.value?.data || guruRes.value || [];
            setGuruList(Array.isArray(rawGuru) ? rawGuru : []);
          }

          if (detailRes.status === "fulfilled" && detailRes.value) {
            const d = detailRes.value;
            setInitialData(d);
            setKelasId(d.kelasId || "");
            setMataPelajaranId(d.mataPelajaranId || "");
            setGuruPengajarId(d.guruPengajarId || "");
          } else {
            setError("Data penugasan kelas mapel tidak ditemukan.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat data edit kelas-mapel:", err);
          setError("Gagal memuat informasi penugasan kelas.");
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setSuccess(null);

    if (!kelasId) {
      setError("Silakan pilih kelas terlebih dahulu.");
      return;
    }
    if (!mataPelajaranId) {
      setError("Silakan pilih mata pelajaran terlebih dahulu.");
      return;
    }
    if (!guruPengajarId) {
      setError("Silakan pilih guru pengajar terlebih dahulu.");
      return;
    }

    setSubmitting(true);

    try {
      await updateKelasMapel(id, {
        kelasId,
        mataPelajaranId,
        guruPengajarId,
      });

      setSuccess("Perubahan penugasan kelas-mapel berhasil disimpan.");
      setTimeout(() => {
        router.push(`/admin/lms-cbt/modul-class/${id}`);
      }, 700);
    } catch (err) {
      console.error("Gagal memperbarui kelas-mapel:", err);
      setError(err?.message || "Gagal memperbarui penugasan kelas-mapel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <Link
              href="/admin/lms-cbt/modul-class"
              className="hover:text-[var(--color-primary)] transition"
            >
              Modul LMS & Class
            </Link>
            <span>/</span>
            {initialData && (
              <>
                <Link
                  href={`/admin/lms-cbt/modul-class/${id}`}
                  className="hover:text-[var(--color-primary)] transition"
                >
                  {initialData?.kelas?.nama || "Detail"}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="theme-text font-medium">Edit Penugasan</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/lms-cbt/modul-class/${id}`}
                className="p-2 border theme-border rounded-lg theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:theme-text transition"
                title="Kembali ke detail kelas"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  Edit Penugasan Kelas LMS
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Perbarui kelas induk, mata pelajaran yang diajarkan, atau guru penanggung jawab.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] flex items-start gap-3 text-xs theme-text">
            <Info size={18} className="text-[var(--color-info)] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-[var(--color-info)]">
                Pembaruan Relasi Kelas-Mapel
              </p>
              <p className="mt-0.5 text-xs opacity-90">
                Mengubah penugasan guru pengampu akan mengalihkan pengelolaan materi, tugas siswa, dan asesmen CBT kelas ini kepada guru baru yang dipilih.
              </p>
            </div>
          </div>

          <div className="w-full theme-card border theme-border rounded-2xl p-6 md:p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {loadingData ? (
              <div className="py-12 text-center space-y-3">
                <Loader2
                  size={28}
                  className="animate-spin text-[var(--color-primary)] mx-auto"
                />
                <p className="text-xs theme-text-secondary">
                  Memuat data penugasan kelas dan daftar master...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-[var(--color-primary)]" />
                      <span>Kelas Induk *</span>
                    </label>
                    <select
                      value={kelasId}
                      onChange={(e) => setKelasId(e.target.value)}
                      required
                      className="theme-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama} {k.tingkat ? `(Tingkat ${k.tingkat})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={15} className="text-[var(--color-primary)]" />
                      <span>Mata Pelajaran *</span>
                    </label>
                    <select
                      value={mataPelajaranId}
                      onChange={(e) => setMataPelajaranId(e.target.value)}
                      required
                      className="theme-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="">-- Pilih Mata Pelajaran --</option>
                      {mapelList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nama} {m.kode ? `(${m.kode})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck size={15} className="text-emerald-600" />
                      <span>Guru Pengampu *</span>
                    </label>
                    <select
                      value={guruPengajarId}
                      onChange={(e) => setGuruPengajarId(e.target.value)}
                      required
                      className="theme-input w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="">-- Pilih Guru Pengampu --</option>
                      {guruList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.namaLengkap} {g.nip ? `(NIP: ${g.nip})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t theme-border-soft">
                  <Link
                    href={`/admin/lms-cbt/modul-class/${id}`}
                    className="px-5 py-2.5 rounded-xl theme-card-soft text-sm font-medium theme-text-secondary hover:brightness-95 transition"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
