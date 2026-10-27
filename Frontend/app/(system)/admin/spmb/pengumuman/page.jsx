import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function PengumumanSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Pengumuman SPMB"
      description="Pengelolaan pengumuman resmi PPDB/SPMB untuk calon peserta didik."
      backHref="/admin/spmb"
      backLabel="Kembali ke SPMB"
      blockers={[
        {
          label: "Model & route Pengumuman PPDB",
          detail:
            "schema.prisma tidak memiliki model pengumuman PPDB, dan tidak ada route/controller /api/pengumuman-ppdb untuk membaca atau menerbitkan pengumuman.",
        },
      ]}
      notes={[
        "Fitur pengumuman SPMB belum diintegrasikan karena sumber datanya belum ada di Backend.",
        "Endpoint POST /api/notifikasi/broadcast hanya membuat catatan Notifikasi untuk pengguna terdaftar. Endpoint itu bukan penyimpanan pengumuman PPDB dan tidak dapat dibaca calon peserta didik di halaman publik.",
        "Modul CMS dan artikel adalah konten umum dengan model berbeda, sehingga tidak dipakai sebagai pengganti pengumuman PPDB.",
        "Halaman publik /PPDB/pengumuman menampilkan empty state, bukan data contoh. Halaman admin ini juga tidak menampilkan pengumuman karangan.",
      ]}
    />
  );
}
