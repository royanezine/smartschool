import { redirect } from "next/navigation";

export default async function DetailJalurRedirectPage({ params }) {
  const { id } = await params;

  redirect(`/admin/spmb/jalur/${encodeURIComponent(String(id))}`);
}
