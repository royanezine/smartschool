"use client";

import { Suspense } from "react";

import PpdbRingkasanPendaftaran from "@/app/components/ppdb/PpdbRingkasanPendaftaran";

export default function KirimPendaftaranPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PpdbRingkasanPendaftaran />
    </Suspense>
  );
}
