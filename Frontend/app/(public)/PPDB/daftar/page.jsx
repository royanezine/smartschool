"use client";

import { Suspense } from "react";
import { daftarPpdb } from "@/services/ppdb.service";
import PpdbForm from "@/app/components/ppdb/PpdbForm";

export default function DaftarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PpdbForm />
    </Suspense>
  );
}
