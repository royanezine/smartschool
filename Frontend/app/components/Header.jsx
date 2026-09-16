"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";

export default function Header({
  toggleSidebar,
  notifications = [],
  user = { name: "Super Admin", email: "admin@smartschool.com", avatar: "SA" },
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200/70 h-14 px-4 md:px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Toggle Sidebar */}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-slate-100 transition-colors text-slate-500"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Logo with Next.js Image */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image
              src="/logo/logoSS.png"
              alt="Smart School Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-semibold text-slate-800 text-sm hidden sm:inline">
            Smart<span className="text-blue-600">School</span>
          </span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-48 lg:w-56 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-500 relative"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Notifikasi</p>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.read ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700">{notif.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{notif.desc}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">Tidak ada notifikasi</div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="text-xs text-blue-600 font-medium hover:underline">Lihat semua</button>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hidden sm:block">
          <HelpCircle size={18} />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {user.avatar || user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-700 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user.email}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <User size={15} className="text-slate-400" />
                Profil
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Settings size={15} className="text-slate-400" />
                Pengaturan
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={15} className="text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}