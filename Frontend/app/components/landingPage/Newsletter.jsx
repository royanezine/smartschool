"use client";

import { Mail, ArrowRight } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="bg-white py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Mail size={30} strokeWidth={1.75} />
        </div>

        <h2 className="mx-auto mt-8 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Dapatkan Informasi Terbaru{" "}
          <span className="text-blue-600">SmartSchool</span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
          Berlangganan newsletter kami untuk mendapatkan update fitur, tips
          pendidikan, dan informasi terbaru seputar SmartSchool.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-12 flex max-w-2xl flex-col gap-4 sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Alamat email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="Masukkan email Anda"
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
          >
            Berlangganan
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </section>
  );
}