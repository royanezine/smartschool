import { redirect } from "next/navigation";

export default async function JalurPendaftaranRedirectPage({ searchParams }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(sp || {}).toString();
  redirect(`/admin/spmb/jalur${qs ? `?${qs}` : ""}`);
}
