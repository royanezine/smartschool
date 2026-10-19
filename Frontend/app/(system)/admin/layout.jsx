"use client";

import AuthGuard from "@/app/components/auth/AuthGuard";

// ======================================================
// ADMIN SEKOLAH LAYOUT
// ======================================================

export default function AdminLayout({ children }) {
  /*
   * Area admin sekolah hanya untuk role "admin_sekolah".
   * Super admin diizinkan mengakses (konsisten dengan middleware
   * role di backend yang selalu meloloskan super_admin).
   */
  return (
    <AuthGuard allowedRoles={["admin_sekolah", "super_admin"]}>
      {children}
    </AuthGuard>
  );
}
