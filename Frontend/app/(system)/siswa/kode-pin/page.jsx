"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function KodePinSiswaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pin/verify");
  }, [router]);

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
