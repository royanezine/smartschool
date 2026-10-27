"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LaporanTambahRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/keuangan/jurnalKas/tambah");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Mengalihkan ke formulir transaksi kas...
        </p>
      </div>
    </div>
  );
}
