"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FoundationPage() {
  const router = useRouter();

  const [hasFoundation, setHasFoundation] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    npyp: "",
    alamat: "",
    telepon: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleContinue = () => {
    const previousData = JSON.parse(
      sessionStorage.getItem("onboardingData") || "{}"
    );

    sessionStorage.setItem(
      "onboardingData",
      JSON.stringify({
        ...previousData,
        yayasan: hasFoundation ? form : null,
      })
    );

    router.push("/onboarding/verify");
  };

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

          <button
            type="button"
            disabled={hasFoundation === null}
            onClick={handleContinue}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </main>
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