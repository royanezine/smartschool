"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CheckoutRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/onboarding/pembayaran${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <CheckoutRedirectContent />
    </Suspense>
  );
}
