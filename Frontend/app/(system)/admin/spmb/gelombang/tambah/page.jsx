import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function TambahGelombangPage() {
  return (
    <SpmbBackendBlocker
      title="Tambah Gelombang"
      description="Form gelombang belum dapat digunakan karena endpoint Backend belum tersedia."
      backHref="/admin/spmb/gelombang"
      backLabel="Kembali ke Gelombang"
      blockers={[
        {
          label: "GET/POST /api/gelombang-ppdb",
          detail:
            "Backend belum memiliki route maupun controller gelombang PPDB. Permintaan ke endpoint ini menghasilkan 404.",
        },
      ]}
      notes={[
        "Form tidak ditampilkan agar tidak seolah-olah data berhasil disimpan.",
        "Modul akan diaktifkan kembali setelah route gelombang tersedia di Backend.",
      ]}
    />
  );
}
