
import {
  clearSession,
  isTokenExpired as isAuthTokenExpired,
} from "./auth";

// Adapter tipis di atas lib/auth. Token auth hanya dibaca dari sessionStorage
// lewat lib/auth; modul ini tidak lagi menjadikan localStorage sumber sesi.
export function isTokenExpired(token: string): boolean {
  return isAuthTokenExpired(token);
}

export function expireSession(): void {
  if (typeof window === "undefined") return;

  clearSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login?sessionExpired=1");
  }
}
