"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, Plus, Construction } from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

export default function CmsArticlePage() {
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
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <span>Admin</span>
                    <span>/</span>
                    <span>CMS</span>
                    <span>/</span>
                    <span className="font-medium text-[#2563EB]">
                      Artikel
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                    Artikel CMS
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Kelola artikel dan berita sekolah.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/cms/article/tambah")
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
                >
                  <Plus size={17} />

                  Tambah Artikel
                </button>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                  <Newspaper size={25} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  Belum ada artikel
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Halaman daftar artikel sedang dalam
                  pengembangan. Gunakan menu CMS Admin untuk
                  mengelola artikel.
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Construction size={14} />

                  <span>Fitur segera hadir</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}