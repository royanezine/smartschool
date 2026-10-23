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
  Calendar,
  Clock,
  Users,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import {
  getKelasMapelById,
  deleteKelasMapel,
} from "@/services/kelasMapel.service";

export default function DetailModulClassPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const result = await getKelasMapelById(id);
        if (isMounted) {
          if (!result) {
            setError("Data kelas pembelajaran tidak ditemukan.");
          } else {
            setData(result);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Gagal memuat detail kelas-mapel:", err);
          setError(err?.message || "Gagal memuat detail kelas pembelajaran.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteKelasMapel(id);
      router.push("/admin/lms-cbt/modul-class");
    } catch (err) {
      console.error("Gagal menghapus penugasan:", err);
      setDeleteError(err?.message || "Gagal menghapus penugasan kelas mapel.");
      setDeleting(false);
    }
  };

  const isAktif = (data?.status || "aktif").toLowerCase() === "aktif";
  const namaKelas = data?.kelas?.nama || "Kelas Belum Ditentukan";
  const tingkatKelas = data?.kelas?.tingkat ? `Tingkat ${data.kelas.tingkat}` : "-";
  const namaMapel = data?.mataPelajaran?.nama || "Mata Pelajaran";
  const kodeMapel = data?.mataPelajaran?.kode || "-";
  const guru = data?.guruPengajar;
  const siswaList = Array.isArray(data?.siswa) ? data.siswa : [];
  const jadwalList = Array.isArray(data?.jadwalMengajar) ? data.jadwalMengajar : [];

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <Link
              href="/admin/lms-cbt/modul-class"
              className="hover:text-[var(--color-primary)] transition"
            >
              Modul LMS & Class
            </Link>
            <span>/</span>
            <span className="theme-text font-medium">Detail Kelas</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/lms-cbt/modul-class"
                className="p-2 border theme-border rounded-lg theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:theme-text transition"
                title="Kembali ke daftar kelas"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  Detail Kelas Pembelajaran LMS
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Informasi relasi kelas, mata pelajaran, guru pengampu, serta siswa terdaftar.
                </p>
              </div>
            </div>

            {data && (
              <div className="flex items-center gap-2.5">
                <Link
                  href={`/admin/lms-cbt/modul-class/${id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border theme-border theme-card hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition text-xs font-semibold theme-text"
                >
                  <Edit3 size={15} />
                  <span>Edit Penugasan</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition text-xs font-semibold"
                >
                  <Trash2 size={15} />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="theme-card border theme-border rounded-2xl p-12 text-center">
              <Loader2
                size={32}
                className="animate-spin text-[var(--color-primary)] mx-auto mb-3"
              />
              <p className="text-sm font-medium theme-text">
                Memuat detail kelas LMS...
              </p>
            </div>
          ) : error ? (
            <div className="theme-card border theme-border rounded-2xl p-8 text-center space-y-4">
              <AlertCircle size={36} className="text-red-500 mx-auto" />
              <div>
                <h3 className="text-base font-semibold theme-text">
                  Gagal Memuat Data
                </h3>
                <p className="text-xs theme-text-secondary mt-1">{error}</p>
              </div>
              <Link
                href="/admin/lms-cbt/modul-class"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:brightness-95 transition"
              >
                <ArrowLeft size={14} />
                Kembali ke Daftar
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="theme-card border theme-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-md">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold theme-text">
                          {namaKelas}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium ${
                            isAktif
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAktif ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {isAktif ? "Status Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="text-sm theme-text-secondary mt-1">
                        {tingkatKelas} • Mata Pelajaran:{" "}
                        <strong className="theme-text">{namaMapel}</strong> (Kode: {kodeMapel})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l theme-border-soft pt-4 md:pt-0 md:pl-6">
                    <div>
                      <p className="text-xs theme-text-muted">Total Siswa Terdaftar</p>
                      <p className="text-xl font-bold theme-text mt-0.5 flex items-center gap-1.5">
                        <Users size={18} className="text-[var(--color-primary)]" />
                        {data.jumlahSiswa ?? siswaList.length} Siswa
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="theme-card border theme-border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 theme-text border-b theme-border-soft pb-3 font-semibold text-sm">
                    <BookOpen size={18} className="text-[var(--color-primary)]" />
                    <span>Informasi Mata Pelajaran</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="theme-text-muted block">Nama Mata Pelajaran</span>
                      <strong className="theme-text text-sm">{namaMapel}</strong>
                    </div>
                    <div>
                      <span className="theme-text-muted block">Kode Pelajaran</span>
                      <strong className="theme-text text-sm">{kodeMapel}</strong>
                    </div>
                    <div>
                      <span className="theme-text-muted block">ID Relasi LMS</span>
                      <code className="theme-text-secondary font-mono text-[11px]">
                        {data.id}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="theme-card border theme-border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 theme-text border-b theme-border-soft pb-3 font-semibold text-sm">
                    <UserCheck size={18} className="text-emerald-600" />
                    <span>Guru Pengampu LMS</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="theme-text-muted block">Nama Lengkap</span>
                      <strong className="theme-text text-sm">
                        {guru?.namaLengkap || "Belum Ditugaskan"}
                      </strong>
                    </div>
                    <div>
                      <span className="theme-text-muted block">NIP</span>
                      <span className="theme-text text-sm font-medium">
                        {guru?.nip || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="theme-text-muted block">Email</span>
                      <span className="theme-text-secondary text-xs">
                        {guru?.email || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="theme-card border theme-border rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 theme-text border-b theme-border-soft pb-3 font-semibold text-sm">
                    <Calendar size={18} className="text-blue-500" />
                    <span>Jadwal Mengajar</span>
                  </div>
                  {jadwalList.length > 0 ? (
                    <div className="space-y-2">
                      {jadwalList.map((j, idx) => (
                        <div
                          key={j.id || idx}
                          className="p-2.5 rounded-xl theme-card-soft text-xs flex items-center justify-between"
                        >
                          <span className="font-semibold theme-text capitalize">
                            {j.hari}
                          </span>
                          <span className="theme-text-secondary flex items-center gap-1">
                            <Clock size={12} />
                            {j.jamMulai} - {j.jamSelesai}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs theme-text-muted italic pt-2">
                      Belum ada jadwal mengajar rutin yang disinkronkan.
                    </p>
                  )}
                </div>
              </div>

              <div className="theme-card border theme-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b theme-border-soft flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-[var(--color-primary)]" />
                    <h3 className="font-semibold text-sm theme-text">
                      Daftar Peserta Didik ({siswaList.length})
                    </h3>
                  </div>
                  <span className="text-xs theme-text-muted">
                    Berdasarkan keanggotaan kelas aktif
                  </span>
                </div>

                {siswaList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="theme-card-soft border-b theme-border-soft text-xs font-semibold theme-text-muted uppercase tracking-wider">
                          <th className="px-5 py-3">No</th>
                          <th className="px-5 py-3">Nama Siswa</th>
                          <th className="px-5 py-3">NISN / NIS</th>
                          <th className="px-5 py-3">Jenis Kelamin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-border-soft text-xs">
                        {siswaList.map((siswa, idx) => (
                          <tr key={siswa.id || idx} className="hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition">
                            <td className="px-5 py-3 theme-text-muted">{idx + 1}</td>
                            <td className="px-5 py-3 font-semibold theme-text">
                              {siswa.namaLengkap}
                            </td>
                            <td className="px-5 py-3 theme-text-secondary">
                              {siswa.nisn || siswa.nis || "-"}
                            </td>
                            <td className="px-5 py-3 theme-text-secondary">
                              {siswa.jenisKelamin === "L" || siswa.jenisKelamin?.toLowerCase() === "laki-laki"
                                ? "Laki-laki"
                                : siswa.jenisKelamin === "P" || siswa.jenisKelamin?.toLowerCase() === "perempuan"
                                ? "Perempuan"
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Users size={28} className="theme-text-placeholder mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium theme-text">
                      Tidak ada data siswa
                    </p>
                    <p className="text-xs theme-text-muted mt-0.5">
                      Siswa pada kelas ini belum di-assign melalui modul akademik keanggotaan kelas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] backdrop-blur-sm">
          <div className="w-full max-w-md theme-card border theme-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold theme-text text-base">
                  Konfirmasi Hapus Penugasan
                </h3>
                <p className="text-xs theme-text-muted mt-0.5">
                  Tindakan ini akan menonaktifkan penugasan kelas ini.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs">
                {deleteError}
              </div>
            )}

            <p className="text-xs theme-text-secondary">
              Apakah Anda yakin ingin menghapus relasi mata pelajaran <strong>{namaMapel}</strong> pada <strong>{namaKelas}</strong>?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl theme-card-soft text-xs font-medium hover:brightness-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:brightness-95 transition disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
