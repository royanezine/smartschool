import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function SeleksiSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Seleksi SPMB"
      description="Penilaian, perangkingan, dan penetapan hasil seleksi calon peserta didik."
      blockers={[
        {
          label: "Endpoint hasil seleksi PPDB",
          detail:
            "Model HasilSeleksiPpdb ada di Prisma, tetapi belum ada route/controller untuk membaca atau menetapkan hasil seleksi.",
        },
      ]}
      notes={[
        "Endpoint baca daftar pendaftar (GET /api/ppdb/pendaftar) belum tersedia, sehingga daftar peserta seleksi belum dapat ditampilkan.",
        "Endpoint verifikasi (PATCH /api/ppdb/:id/verifikasi) tersedia, tetapi membutuhkan ID pendaftar yang belum dapat dibaca dari daftar.",
        "Data peringkat dan hasil seleksi contoh sudah dihapus dari halaman ini.",
      ]}
    />
  );
}
