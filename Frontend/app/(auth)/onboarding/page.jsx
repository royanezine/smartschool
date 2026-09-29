"use client";

import { useEffect } from "react";

export default function OnboardingPage() {
  useEffect(() => {
    const paketId = sessionStorage.getItem("selected_paket_id");

    if (paketId) {
      window.location.href = `/onboarding/school?paketId=${paketId}`;
    } else {
      window.location.href = "/#pricing";
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

        <p className="text-sm text-slate-500">
          Menyiapkan pendaftaran...
        </p>
      </div>
    </main>
  );
}