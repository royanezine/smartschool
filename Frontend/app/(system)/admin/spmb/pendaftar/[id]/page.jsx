import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function DetailPendaftarPage() {
  return (
    <SpmbBackendBlocker
      title="Detail Pendaftar"
      description="Detail data calon peserta didik, berkas, dan status verifikasi."
      sidebarRole="adminPPDB"
      active="pendaftar"
      blockers={[
        {
          label: "GET /api/ppdb/:id",
          detail:
            "Endpoint detail pendaftar belum tersedia. GET /api/ppdb/pendaftar juga belum tersedia.",
        },
      ]}
      notes={[
        "Data detail pendaftar contoh sudah dihapus.",
        "Halaman ini tidak melakukan permintaan jaringan karena tidak ada endpoint yang valid.",
      ]}
      backHref="/admin/spmb/pendaftar"
      backLabel="Kembali ke Pendaftar"
    />
  );
}
