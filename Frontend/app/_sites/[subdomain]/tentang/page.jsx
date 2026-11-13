import ProfilSekolahPage from "@/app/[tenant]/tentang/page";

export default async function SiteTentangPage({ params }) {
  const resolved = await params;
  const subdomain = resolved?.subdomain || "";

  return (
    <ProfilSekolahPage params={Promise.resolve({ tenant: subdomain })} />
  );
}
