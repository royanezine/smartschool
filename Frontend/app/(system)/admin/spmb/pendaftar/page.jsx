import { redirect } from "next/navigation";

export default async function PendaftarSpmbPage({ searchParams }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(sp || {}).toString();
  redirect(`/admin/spmb/data-pendaftaran${qs ? `?${qs}` : ""}`);
}
