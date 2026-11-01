"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function EditRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.replace(`/super-admin/yayasan/${id}/edit`);
    } else {
      router.replace("/super-admin/yayasan");
    }
  }, [id, router]);

  return (
    <div className="theme-page theme-text min-h-full flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
        <p className="text-sm theme-text-muted">Mengarahkan ke halaman edit yayasan...</p>
      </div>
    </div>
  );
}

export default function EditYayasanRedirectPage() {
  return (
    <Suspense fallback={
      <div className="theme-page theme-text min-h-full flex items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <EditRedirectContent />
    </Suspense>
  );
}
