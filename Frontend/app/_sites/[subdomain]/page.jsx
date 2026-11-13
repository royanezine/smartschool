import TenantHomePage from "@/app/[tenant]/page";

export default async function SiteHomePage({ params, searchParams }) {
  const resolved = await params;
  const subdomain = resolved?.subdomain || "";

  return (
    <TenantHomePage
      params={Promise.resolve({ tenant: subdomain })}
      searchParams={searchParams}
    />
  );
}
