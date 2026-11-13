"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function TambahLanggananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/super-admin/langgananSekolah${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}

export default function TambahLanggananRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <TambahLanggananContent />
    </Suspense>
  );
}
