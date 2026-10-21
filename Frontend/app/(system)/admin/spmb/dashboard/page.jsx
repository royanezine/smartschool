import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function DashboardSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Dashboard SPMB"
      description="Ringkasan statistik pendaftaran, verifikasi, dan seleksi calon peserta didik."
      blockers={[
        {
          label: "GET /api/ppdb/pendaftar",
          detail:
            "Dibutuhkan untuk menghitung total pendaftar, status verifikasi, tren pendaftaran, dan aktivitas terbaru.",
        },
        {
          label: "GET /api/ppdb/dashboard",
          detail:
            "Endpoint agregat khusus dashboard belum tersedia. Alternatifnya, Frontend dapat menghitung dari daftar pendaftar bila endpoint daftar tersedia.",
        },
      ]}
      notes={[
        "Seluruh angka pada dashboard sebelumnya berasal dari data contoh dan sudah dihapus.",
        "Dashboard tidak akan menampilkan angka sampai endpoint daftar/agregat tersedia di Backend.",
      ]}
    />
  );
}
