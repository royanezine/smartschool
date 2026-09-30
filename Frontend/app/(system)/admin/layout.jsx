"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
];

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
    const skipGuard =
      process.env.NEXT_PUBLIC_SKIP_AUTH_GUARD === "true";

    // Jika auth guard tidak dilewati dan tidak ada token,
    // arahkan user ke halaman login.
    if (!skipGuard && !isAuthenticated()) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  // Cegah flash konten admin sebelum pengecekan login selesai.
  if (!checked) {
    return (
      <div
        className="
          flex h-screen w-full items-center justify-center
          bg-[#f5f9ff] dark:bg-[#0b1220]
          transition-colors duration-300
        "
      >
        <div className="flex flex-col items-center gap-3">
          {/* Loading indicator */}
          <div
            className="
              h-8 w-8 animate-spin rounded-full
              border-2 border-blue-200
              border-t-[#2474e8]
              dark:border-slate-700
              dark:border-t-blue-500
            "
          />

          <p
            className="
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Memeriksa sesi login...
          </p>
        </div>
      </div>
    );
  }

  return children;
}