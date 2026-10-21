"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import PpdbRingkasanPendaftaran from "@/app/components/ppdb/PpdbRingkasanPendaftaran";

function KirimPendaftaranTenantContent() {
  const params = useParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant;

  const basePath = tenant ? `/${tenant}` : "";

  return <PpdbRingkasanPendaftaran basePath={basePath} />;
}

export default function KirimPendaftaranPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <KirimPendaftaranTenantContent />
    </Suspense>
  );
}
