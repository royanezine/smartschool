"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Newspaper, ArrowRight, Construction } from "lucide-react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

export default function CmsPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const menuItems = [
    {
      title: "Halaman",
      description: "Kelola halaman website sekolah",
      icon: FileText,
      href: "/cmsAdmin/pages",
    },
    {
      title: "Artikel",
      description: "Kelola artikel dan berita sekolah",
      icon: Newspaper,
      href: "/admin/cms/article",
    },
  ];

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
                    <span className="font-medium text-[#2563EB]">
                      CMS
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                    Manajemen Konten (CMS)
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Kelola konten website sekolah seperti
                    halaman dan artikel.
                  </p>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <Construction
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Halaman sedang dalam pengembangan
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Modul CMS lengkap dengan pengelolaan
                    halaman, artikel, kategori, media, dan
                    banner tersedia di menu CMS Admin.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => router.push(item.href)}
                      className="group flex min-h-[125px] flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                          <Icon size={19} />
                        </div>

                        <ArrowRight
                          size={17}
                          className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#2563EB]"
                        />
                      </div>

                      <div className="mt-4">
                        <h3 className="text-sm font-bold text-slate-800">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}