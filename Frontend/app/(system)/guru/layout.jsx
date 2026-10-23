"use client";

import AuthGuard from "@/app/components/auth/AuthGuard";


export default function GuruLayout({ children }) {
  return (
    <AuthGuard allowedRoles={["guru", "super_admin"]}>
      {children}
    </AuthGuard>
  );
}
