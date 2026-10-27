"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LaporanDetailRedirectPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/admin/keuangan/jurnalKas/detail/${params.id}`);
    } else {
      router.replace("/admin/keuangan/jurnalKas");
    }
  }, [params?.id, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Mengalihkan ke detail transaksi...
        </p>
      </div>
    </div>
  );
}


