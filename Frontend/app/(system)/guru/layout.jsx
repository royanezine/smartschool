"use client";

import AuthGuard from "@/app/components/auth/AuthGuard";

// ======================================================
// GURU LAYOUT
// ======================================================

export default function GuruLayout({ children }) {
  /*
   * Area guru hanya untuk sesi dengan role "guru".
   * Penjagaan sesi & role ditangani satu sumber kebenaran
   * (lib/auth) lewat AuthGuard. Super admin tetap diizinkan
   * (konsisten dengan middleware role di backend).
   */
  return (
    <AuthGuard allowedRoles={["guru", "super_admin"]}>
      {children}
    </AuthGuard>
  );
}
