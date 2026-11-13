import { redirect } from "next/navigation";

export default async function DetailPendaftarPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams(sp || {}).toString();

  redirect(
    `/admin/spmb/data-pendaftaran/${encodeURIComponent(String(id || ""))}${qs ? `?${qs}` : ""}`
  );
}
