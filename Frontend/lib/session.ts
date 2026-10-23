
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const payload = JSON.parse(
      window.atob(padded)
    );

    if (typeof payload.exp !== "number") return false;

    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

export function expireSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  if (window.location.pathname !== "/login") {
    window.location.replace("/login?sessionExpired=1");
  }
}
