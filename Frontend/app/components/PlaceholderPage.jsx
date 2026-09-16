"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { Flag } from "lucide-react";

export default function PlaceholderPage({ active, title, description }) {
  const [activeMenu, setActiveMenu] = useState(active);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-light text-slate-800 tracking-tight">
                {title}
                <span className="ml-2 md:ml-3 text-xs md:text-sm font-normal text-slate-400 bg-white px-2 md:px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
                  Super Admin
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">{description}</p>
            </div>

            <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-4">
                <Flag size={20} className="text-slate-300" />
              </div>
              <h3 className="text-sm md:text-base font-medium text-slate-500">Halaman ini segera hadir</h3>
              <p className="text-xs md:text-sm text-slate-400 mt-1.5 max-w-sm">
                Modul {title} sedang dalam pengembangan dan akan tersedia pada rilis berikutnya.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}