"use client";

import { useParams } from "next/navigation";

export default function SiteHomePage() {
  const params = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Website Sekolah
        </h1>

        <p className="mt-3 text-slate-600">
          Subdomain: {params?.subdomain}
        </p>
      </div>
    </div>
  );
}