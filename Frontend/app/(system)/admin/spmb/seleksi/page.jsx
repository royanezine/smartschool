import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function SeleksiSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Seleksi SPMB"
      description="Penilaian, perangkingan, dan penetapan hasil seleksi calon peserta didik."
      blockers={[
        {
          label: "GET /api/ppdb/pendaftar",
          detail:
            "Daftar pendaftar dan nilai rapor dibutuhkan sebagai dasar seleksi.",
        },
        {
          label: "Endpoint hasil seleksi PPDB",
          detail:
            "Model HasilSeleksiPpdb ada di Prisma, tetapi belum ada route/controller untuk membaca atau menetapkan hasil seleksi.",
        },
      ]}
      notes={[
        "Verifikasi kelulusan saat ini hanya tersedia melalui PATCH /api/ppdb/:id/verifikasi dan membutuhkan ID pendaftaran yang diketahui.",
        "Data peringkat dan hasil seleksi contoh sudah dihapus dari halaman ini.",
      ]}
    />
  );
}
