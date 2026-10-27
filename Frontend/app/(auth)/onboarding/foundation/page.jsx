"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function FoundationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paketId = searchParams.get("paketId");

  const [hasFoundation, setHasFoundation] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    npyp: "",
    alamat: "",
    telepon: "",
    email: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContinue = () => {
    if (hasFoundation === null) return;
    setError("");

    if (hasFoundation && !form.nama.trim()) {
      setError("Nama yayasan wajib diisi jika sekolah memiliki yayasan.");
      return;
    }

    if (!paketId) {
      setError("Paket belum dipilih. Silakan pilih paket terlebih dahulu.");
      return;
    }

    // Build URL dengan query parameters untuk data yayasan
    const params = new URLSearchParams({ paketId });
    
    if (hasFoundation && form.nama.trim()) {
      params.set("hasFoundation", "true");
      params.set("namaYayasan", form.nama.trim());
      if (form.npyp.trim()) params.set("npypYayasan", form.npyp.trim());
      if (form.alamat.trim()) params.set("alamatYayasan", form.alamat.trim());
      if (form.telepon.trim()) params.set("teleponYayasan", form.telepon.trim());
      if (form.email.trim()) params.set("emailYayasan", form.email.trim());
    } else {
      params.set("hasFoundation", "false");
    }

    router.push(`/onboarding/school?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-blue-600">
            Langkah 3 dari 4
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Data Yayasan
          </h1>

          <p className="mt-2 text-slate-500">
            Apakah sekolah Anda berada di bawah yayasan?
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setHasFoundation(true)}
              className={`rounded-xl border p-4 font-semibold ${
                hasFoundation === true
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-slate-200"
              }`}
            >
              Ya, ada yayasan
            </button>

            <button
              type="button"
              onClick={() => setHasFoundation(false)}
              className={`rounded-xl border p-4 font-semibold ${
                hasFoundation === false
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-slate-200"
              }`}
            >
              Tidak ada yayasan
            </button>
          </div>

          {hasFoundation && (
            <div className="mt-6 space-y-4">
              <Input
                label="Nama Yayasan"
                name="nama"
                value={form.nama}
                onChange={handleChange}
              />

              <Input
                label="NPYP"
                name="npyp"
                value={form.npyp}
                onChange={handleChange}
              />

              <Input
                label="Email Yayasan"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                label="Nomor Telepon"
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Alamat Yayasan
                </label>

                <textarea
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={hasFoundation === null}
            onClick={handleContinue}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </main>
  );
}

export default function FoundationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium">Memuat...</span>
          </div>
        </main>
      }
    >
      <FoundationContent />
    </Suspense>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}