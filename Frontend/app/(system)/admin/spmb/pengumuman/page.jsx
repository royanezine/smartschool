import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function PengumumanSpmbPage() {
  return (
    <SpmbBackendBlocker
      title="Pengumuman SPMB"
      description="Pengelolaan pengumuman resmi PPDB/SPMB untuk calon peserta didik."
      blockers={[
        {
          label: "Model/route Pengumuman PPDB",
          detail:
            "Belum ada model pengumuman PPDB di Prisma dan belum ada route/controller pengumuman.",
        },
      ]}
      notes={[
        "Daftar pengumuman contoh sudah dihapus dari halaman admin dan halaman publik.",
        "Halaman publik /PPDB/pengumuman sekarang menampilkan empty state yang jujur.",
      ]}
    />
  );
}
