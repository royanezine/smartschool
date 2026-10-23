import { redirect } from "next/navigation";

export default async function DetailPendaftarPage({ params }) {
  const { id } = await params;

  redirect(
    `/admin/spmb/data-pendaftaran/${encodeURIComponent(String(id))}`
  );
}
