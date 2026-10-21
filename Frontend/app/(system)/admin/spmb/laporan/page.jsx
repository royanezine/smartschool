import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function LaporanSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Laporan SPMB"
      description="Rekap dan ekspor data pendaftaran, verifikasi, serta hasil seleksi."
      blockers={[
        {
          label: "GET /api/ppdb/pendaftar",
          detail:
            "Sumber data untuk rekap per jalur, per status, dan per sekolah belum tersedia.",
        },
        {
          label: "GET /api/ppdb/laporan",
          detail:
            "Endpoint laporan/agregat khusus belum tersedia di Backend.",
        },
      ]}
      notes={[
        "Tombol ekspor CSV/Excel tidak diaktifkan karena tidak ada data nyata yang dapat diekspor.",
        "Data contoh pada halaman laporan sudah dihapus.",
      ]}
    />
  );
}
