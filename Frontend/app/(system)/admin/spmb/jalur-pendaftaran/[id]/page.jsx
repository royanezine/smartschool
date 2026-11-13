import { redirect } from "next/navigation";

export default async function DetailJalurRedirectPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams(sp || {}).toString();

  redirect(
    `/admin/spmb/jalur/${encodeURIComponent(String(id || ""))}${qs ? `?${qs}` : ""}`
  );
}
