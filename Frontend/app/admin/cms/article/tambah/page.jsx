"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

export default function CmsArticleTambahPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="cms"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div
        className={`flex h-screen min-w-0 flex-col transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-[88px]" : "lg:ml-[260px]"
        }`}
      >
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <button
                type="button"
                onClick={() => router.push("/admin/cms/article")}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[#2563EB]"
              >
                <ArrowLeft size={16} />

                Kembali ke Artikel
              </button>

              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <span>Admin</span>
                  <span>/</span>
                  <span>CMS</span>
                  <span>/</span>
                  <span>Artikel</span>
                  <span>/</span>
                  <span className="font-medium text-[#2563EB]">
                    Tambah
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                  Tambah Artikel
                </h1>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Buat artikel baru untuk website sekolah.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Construction size={25} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  Formulir dalam pengembangan
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Formulir tambah artikel masih disiapkan.
                  Gunakan menu CMS Admin untuk mengelola
                  artikel.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/cmsAdmin")}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                >
                  Buka CMS Admin
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}