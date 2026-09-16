"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PencilLine,
  Construction,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

export default function MediaEditPage({ params }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <div className="shrink-0">
        <Sidebar
          active={"media"}
          setActive={() => {}}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="min-w-0 flex-1">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">
              <div className="mb-5 flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/cmsAdmin/media")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ArrowLeft className="h-4 w-4" />

                  <span>Kembali</span>
                </button>
              </div>

              <section className="relative mb-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 shadow-xl shadow-indigo-900/10">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />

                <div className="relative p-5 sm:p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner backdrop-blur-md sm:h-14 sm:w-14">
                      <PencilLine className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200 sm:text-xs">
                        CMS Management
                      </p>

                      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Edit Media
                      </h1>

                      <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-indigo-100 sm:text-sm">
                        Perbarui detail file media.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Construction className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  Halaman dalam pengembangan
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-400">
                  Fitur edit media belum tersedia di sini.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/cmsAdmin/media")
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  <ArrowLeft className="h-4 w-4" />

                  Kembali ke Media
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}