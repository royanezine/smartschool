import SpmbBackendBlocker from "@/app/components/spmb/SpmbBackendBlocker";

export default function EditGelombangPage() {
  return (
    <SpmbBackendBlocker
      title="Edit Gelombang"
      description="Form gelombang belum dapat digunakan karena endpoint Backend belum tersedia."
      backHref="/admin/spmb/gelombang"
      backLabel="Kembali ke Gelombang"
      blockers={[
        {
          label: "GET/PUT/DELETE /api/gelombang-ppdb/:id",
          detail:
            "Backend belum memiliki route maupun controller gelombang PPDB. Permintaan ke endpoint ini menghasilkan 404.",
        },
      ]}
      notes={[
        "Detail gelombang tidak dapat dimuat karena sumber datanya belum ada.",
        "Modul akan diaktifkan kembali setelah route gelombang tersedia di Backend.",
      ]}
    />
  );
}
