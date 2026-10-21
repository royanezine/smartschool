import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function PendaftarSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Pendaftar SPMB"
      description="Verifikasi berkas, kelulusan, dan konversi pendaftar menjadi siswa."
      active="pendaftar"
      blockers={[
        {
          label: "GET /api/ppdb/pendaftar",
          detail:
            "Endpoint daftar pendaftar belum tersedia di Backend (diuji dan mengembalikan 404). Tanpa endpoint ini, daftar pendaftar tidak dapat dimuat.",
        },
        {
          label: "GET /api/ppdb/:id",
          detail:
            "Endpoint detail pendaftar juga belum tersedia, sehingga data dan berkas per pendaftar tidak dapat dibaca.",
        },
      ]}
      notes={[
        "Data pendaftar contoh sudah dihapus; halaman ini tidak menampilkan data rekaan.",
        "Pendaftaran baru tetap dapat dikirim melalui POST /api/ppdb/daftar dari menu Data Pendaftaran > Tambah Pendaftar.",
        "PATCH /api/ppdb/:id/verifikasi tersedia, tetapi membutuhkan ID pendaftaran nyata yang saat ini belum dapat dibaca dari daftar.",
      ]}
      backHref="/admin/spmb"
      backLabel="Kembali ke SPMB"
    />
  );
}
