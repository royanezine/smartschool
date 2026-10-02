"use client";

import { useParams } from "next/navigation";
import PublicTheme from "@/app/components/tenant/PublicTheme";

export default function TenantLayout({ children }) {
  const params = useParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant;

  return (
    <>
      <PublicTheme tenant={tenant} />

      {children}
    </>
  );
}