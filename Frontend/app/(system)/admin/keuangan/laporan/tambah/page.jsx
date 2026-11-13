"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LaporanTambahContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/admin/keuangan/jurnalKas/tambah${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-slate-500">Mengarahkan ke tambah jurnal kas...</p>
      </div>
    </div>
  );
}

export default function LaporanTambahRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <LaporanTambahContent />
    </Suspense>
  );
}
