import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function DashboardSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Dashboard SPMB"
      description="Ringkasan statistik pendaftaran, verifikasi, dan seleksi calon peserta didik."
      blockers={[
        {
          label: "GET /api/ppdb/dashboard",
          detail:
            "Endpoint agregat khusus dashboard belum tersedia di Backend.",
        },
      ]}
      notes={[
        "Endpoint baca daftar pendaftar (GET /api/ppdb/pendaftar) juga belum tersedia, sehingga angka dashboard belum dapat dihitung dari data nyata.",
        "Seluruh angka pada dashboard sebelumnya berasal dari data contoh dan sudah dihapus.",
        "Dashboard tidak akan menampilkan angka sampai endpoint baca daftar dan endpoint agregat tersedia.",
      ]}
    />
  );
}
