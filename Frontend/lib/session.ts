
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

    // Jika token tidak memiliki exp, biarkan
    // server menentukan validitas token.
    if (typeof payload.exp !== "number") return false;

    return Date.now() >= payload.exp * 1000;
  } catch {
    // Token yang tidak bisa dibaca akan divalidasi server.
    return false;
  }
}

export function expireSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  // Hindari redirect berulang ketika sudah di halaman login.
  if (window.location.pathname !== "/login") {
    window.location.replace("/login?sessionExpired=1");
  }
}
