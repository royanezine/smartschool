"use client";

import { useParams } from "next/navigation";

export default function TentangPage() {
  const params = useParams();

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">
        Tentang Sekolah
      </h1>

      <p className="mt-3">
        Subdomain: {params?.subdomain}
      </p>
    </div>
  );
}