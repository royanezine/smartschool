"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TambahLanggananRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/super-admin/langgananSekolah");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
    </div>
  );
}