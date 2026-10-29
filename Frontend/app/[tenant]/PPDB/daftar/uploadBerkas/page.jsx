"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { uploadBerkasPpdb } from "@/services/ppdb.service";
import PpdbUploadBerkas from "@/app/components/ppdb/PpdbUploadBerkas";

function UploadBerkasTenantContent() {
  const params = useParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant;

  const basePath = tenant ? `/${tenant}` : "";

  return <PpdbUploadBerkas basePath={basePath} />;
}

export default function UploadBerkasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <UploadBerkasTenantContent />
    </Suspense>
  );
}
