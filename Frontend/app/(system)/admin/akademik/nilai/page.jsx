"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function NilaiRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/admin/eraport${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center theme-page">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-primary" />
        <p className="text-sm theme-text-secondary">
          Mengalihkan ke modul Nilai & E-Raport...
        </p>
      </div>
    </div>
  );
}

export default function NilaiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center theme-page">
          <Loader2 className="animate-spin text-primary" />
        </div>
      }
    >
      <NilaiRedirectContent />
    </Suspense>
  );
}
