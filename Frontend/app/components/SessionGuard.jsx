
"use client";

import { useEffect } from "react";
import { clearSession, getToken, isTokenExpired } from "@/lib/auth";

export default function SessionGuard() {
  useEffect(() => {
    let expired = false;

    const checkSession = () => {
      if (expired) return;

      const token = getToken();

      if (!token) return;

      if (isTokenExpired(token)) {
        expired = true;
        clearSession();

        if (window.location.pathname !== "/login") {
          window.location.replace("/login?sessionExpired=1");
        }
      }
    };

    checkSession();

    const interval = window.setInterval(checkSession, 5000);

    document.addEventListener("visibilitychange", checkSession);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener(
        "visibilitychange",
        checkSession
      );
    };
  }, []);

  return null;
}
