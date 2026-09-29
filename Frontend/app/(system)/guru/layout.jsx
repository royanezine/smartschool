"use client";

import Header from "../../components/Header";
import GuruSidebar from "../../components/sidebar/guruSidebar";

export default function GuruLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <Header />

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar Guru */}
        <GuruSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}