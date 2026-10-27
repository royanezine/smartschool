"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NilaiPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/eraport");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center theme-page">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm theme-text-muted">Mengalihkan ke modul E-Rapor & Rekap Nilai...</p>
      </div>
    </div>
  );
}
