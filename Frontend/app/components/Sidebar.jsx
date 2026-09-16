"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  School,
  Building2,
  Package,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Bell,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";

const menuSections = [
  { type: "item", key: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/super-admin" },
  { type: "header", label: "DATA MASTER" },
  { type: "item", key: "sekolah", icon: School, label: "Sekolah", path: "/super-admin/sekolah" },
  { type: "item", key: "yayasan", icon: Building2, label: "Yayasan", path: "/super-admin/yayasan" },
  { type: "header", label: "PRODUK" },
  { type: "item", key: "paket", icon: Package, label: "Paket & Modul", path: "/paket" },
  { type: "item", key: "langganan", icon: Users, label: "Langganan Sekolah", path: "/langganan" },
  { type: "header", label: "ADMINISTRASI" },
  { type: "item", key: "role", icon: ShieldCheck, label: "Manajemen Akses", path: "/role" },
  { type: "item", key: "laporan", icon: FileText, label: "Laporan & Analitik", path: "/laporan" },
  { type: "header", label: "SISTEM" },
  { type: "item", key: "pengaturan", icon: Settings, label: "Pengaturan Sistem", path: "/pengaturan" },
  { type: "item", key: "notifikasi", icon: Bell, label: "Notifikasi & Pengumuman", path: "/notifikasi" },
  { type: "item", key: "profil", icon: User, label: "Profil & Logout", path: "/profil" },
];

export default function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/login");
  };

  const handleMenuClick = (item) => {
    setActive(item.key);
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <aside 
      className={`
        ${collapsed ? 'w-[72px]' : 'w-60'} 
        bg-white
        border-r border-slate-200/60
        flex flex-col 
        transition-all duration-300 ease-out
        flex-shrink-0 h-screen sticky top-0
        shadow-[0_0_30px_rgba(0,0,0,0.02)]
      `}
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-blue-400/30 via-blue-500/60 to-indigo-400/30" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200/40">
        <div className={`
          relative rounded-xl 
          bg-white
          border border-slate-200/60
          flex items-center justify-center 
          shadow-sm
          transition-all duration-300
          ${collapsed ? 'w-10 h-10' : 'w-9 h-9'}
        `}>
          <Image
            src="/logo/logoSS.png"
            alt="Smart School Logo"
            width={collapsed ? 32 : 28}
            height={collapsed ? 32 : 28}
            className="object-contain"
            priority
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-slate-800 text-sm tracking-tight">
              Smart<span className="text-blue-600">School</span>
            </span>
            <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
              Super Admin
            </span>
          </div>
        )}
      </div>

      {/* Mini Profile */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">Super Admin</p>
              <p className="text-[9px] text-slate-400 truncate">admin@smartschool.com</p>
            </div>
            <Sparkles size={12} className="text-blue-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menuSections.map((item, index) => {
          if (item.type === "header") {
            if (collapsed) return null;
            return (
              <div key={`header-${index}`} className="px-2 pt-4 pb-1.5">
                <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-widest">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = active === item.key || pathname === item.path;

          return (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item)}
              className={`
                relative flex items-center gap-3 w-full px-2.5 py-2 rounded-lg 
                text-sm font-medium transition-all duration-200 ease-out
                ${isActive 
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-100/30' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/80'
                }
                ${collapsed ? 'justify-center px-2' : ''}
                group
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              )}

              <item.icon 
                size={18} 
                className={`
                  flex-shrink-0 transition-all duration-200
                  ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}
                `}
              />
              
              {!collapsed && (
                <span className="flex-1 text-left text-xs">{item.label}</span>
              )}
              
              {!collapsed && isActive && (
                <div className="w-1 h-1 rounded-full bg-blue-400" />
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800/95 text-white text-[10px] rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out translate-x-1 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-lg">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800/95 rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200/40 p-3">
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-2.5 py-2 rounded-lg 
            text-sm font-medium transition-all duration-200
            text-slate-400 hover:text-red-500 hover:bg-red-50/60
            group
            ${collapsed ? 'justify-center px-2' : ''}
          `}
        >
          <LogOut size={18} className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
          {!collapsed && <span className="text-xs">Logout</span>}
        </button>
      </div>
    </aside>
  );
}