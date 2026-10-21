"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import PpdbForm from "@/app/components/ppdb/PpdbForm";

function DaftarTenantContent() {
  const params = useParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant;

  const basePath = tenant ? `/${tenant}` : "";

  return (
    <PpdbForm
      basePath={basePath}
      tenantSubdomain={tenant ? String(tenant) : ""}
    />
  );
}

export default function DaftarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <DaftarTenantContent />
    </Suspense>
  );
}
