"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paketId = searchParams.get("paketId");

    if (paketId) {
      // Langsung ke foundation dengan paketId
      router.push(`/onboarding/foundation?paketId=${paketId}`);
    } else {
      // Kembali ke halaman utama untuk memilih paket
      router.push("/#pricing");
    }
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

        <p className="text-sm text-slate-500">
          Menyiapkan pendaftaran...
        </p>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Memuat...</p>
        </div>
      </main>
    }>
      <OnboardingContent />
    </Suspense>
  );
}