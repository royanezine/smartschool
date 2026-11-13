"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LaporanDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = params?.id ? encodeURIComponent(String(params.id)) : "";
    const qs = searchParams.toString();
    const query = qs ? `?${qs}` : "";

    if (id) {
      router.replace(`/admin/keuangan/jurnalKas/detail/${id}${query}`);
    } else {
      router.replace(`/admin/keuangan/jurnalKas${query}`);
    }
  }, [params?.id, router, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-slate-500">Mengarahkan ke detail jurnal kas...</p>
      </div>
    </div>
  );
}

export default function LaporanDetailRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <LaporanDetailContent />
    </Suspense>
  );
}
