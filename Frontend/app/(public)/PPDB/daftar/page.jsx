"use client";

import { Suspense } from "react";

import PpdbForm from "@/app/components/ppdb/PpdbForm";

export default function DaftarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PpdbForm />
    </Suspense>
  );
}
