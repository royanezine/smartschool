
"use client";

import AuthGuard from "@/app/components/auth/AuthGuard";
import { CmsThemeProvider } from "@/app/components/CmsThemeProvider";

// ======================================================
// ADMIN SEKOLAH LAYOUT
// ======================================================

export default function AdminLayout({ children }) {
  return (
    <AuthGuard allowedRoles={["admin_sekolah", "super_admin"]}>
      <CmsThemeProvider>
        {children}
      </CmsThemeProvider>
    </AuthGuard>
  );
}
