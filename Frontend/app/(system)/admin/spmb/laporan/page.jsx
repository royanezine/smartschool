import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function LaporanSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Laporan SPMB"
      description="Rekap dan ekspor data pendaftaran, verifikasi, serta hasil seleksi."
      blockers={[
        {
          label: "GET /api/ppdb/laporan",
          detail:
            "Endpoint laporan/agregat khusus belum tersedia di Backend.",
        },
      ]}
      notes={[
        "Endpoint baca daftar pendaftar (GET /api/ppdb/pendaftar) maupun endpoint agregat laporan belum tersedia di Backend.",
        "Halaman laporan khusus ini belum diaktifkan karena sumber datanya belum ada.",
        "Data contoh pada halaman laporan sudah dihapus.",
      ]}
    />
  );
}
