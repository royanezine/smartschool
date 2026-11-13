import TenantLayout from "@/app/[tenant]/layout";

export default async function SiteSubdomainLayout({ children, params }) {
  const resolved = await params;
  const subdomain = resolved?.subdomain || "";

  return (
    <TenantLayout params={Promise.resolve({ tenant: subdomain })}>
      {children}
    </TenantLayout>
  );
}
