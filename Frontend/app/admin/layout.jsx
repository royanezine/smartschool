"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEYS = ["token", "accessToken", "access_token", "authToken", "jwt"];

function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return TOKEN_KEYS.some((key) => {
    const value = localStorage.getItem(key);
    return value && value.trim();
  });
}

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const skipGuard = process.env.NEXT_PUBLIC_SKIP_AUTH_GUARD === "true";

    if (!skipGuard && !isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  // Cegah "flash" konten admin sebelum redirect ke /login selesai
  if (!checked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Memeriksa sesi login...</p>
      </div>
    );
  }

  return children;
}