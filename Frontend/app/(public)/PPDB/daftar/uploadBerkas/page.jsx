"use client";

import { Suspense } from "react";

import PpdbUploadBerkas from "@/app/components/ppdb/PpdbUploadBerkas";

export default function UploadBerkasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PpdbUploadBerkas />
    </Suspense>
  );
}
