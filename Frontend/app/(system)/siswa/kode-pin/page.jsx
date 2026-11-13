"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function KodePinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/pin/verify${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center theme-page">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-medium theme-text-secondary">
          Mengarahkan ke halaman verifikasi PIN...
        </p>
      </div>
    </div>
  );
}

export default function KodePinSiswaRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center theme-page">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <KodePinContent />
    </Suspense>
  );
}
