
"use client";

import { useEffect } from "react";
import { expireSession, isTokenExpired } from "@/lib/session";

export default function SessionGuard() {
  useEffect(() => {
    let expired = false;

    const checkSession = () => {
      if (expired) return;

      const token = localStorage.getItem("token");

      if (!token) return;

      if (isTokenExpired(token)) {
        expired = true;
        expireSession();
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
