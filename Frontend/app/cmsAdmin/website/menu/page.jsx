// app/cmsAdmin/website/menu/page.jsx
"use client";

import { useState } from "react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  Plus,
  Layout,
  Footprints,
  Layers,
  List,
  Monitor,
  Smartphone,
  Settings,
  ChevronRight,
  Menu as MenuIcon,
  GripVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// =========================================================
// DUMMY DATA MENU
// =========================================================
const dummyMenus = [
  { id: 1, title: "Beranda", type: "header", url: "/", order: 1, status: "aktif" },
  { id: 2, title: "Profil", type: "header", url: "/profil", order: 2, status: "aktif" },
  { id: 3, title: "Layanan", type: "header", url: "/layanan", order: 3, status: "aktif" },
  { id: 4, title: "Syarat & Ketentuan", type: "footer", url: "/syarat", order: 1, status: "aktif" },
  { id: 5, title: "Kebijakan Privasi", type: "footer", url: "/privasi", order: 2, status: "aktif" },
  { id: 6, title: "Kontak Kami", type: "footer", url: "/kontak", order: 3, status: "aktif" },
  { id: 7, title: "Berita", type: "header", url: "/berita", order: 4, status: "nonaktif" },
  { id: 8, title: "Galeri", type: "header", url: "/galeri", order: 5, status: "nonaktif" },
];

export default function MenuPage() {
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("semua");

  const filteredMenus = dummyMenus
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => (filterType === "semua" ? true : m.type === filterType));

  const totalMenus = dummyMenus.length;
  const headerCount = dummyMenus.filter((m) => m.type === "header").length;
  const footerCount = dummyMenus.filter((m) => m.type === "footer").length;
  const activeCount = dummyMenus.filter((m) => m.status === "aktif").length;

  return (
    // HAPUS overflow-x-hidden agar sidebar tidak terpotong
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* SIDEBAR - flex-shrink-0 agar tidak mengecil */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN AREA - flex-1 dan min-w-0 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Menu Website"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full min-w-0 space-y-6">
            {/* BREADCRUMB */}
            <nav className="flex items-center flex-wrap gap-1 text-xs sm:text-sm text-slate-500">
              <a href="/cmsAdmin" className="hover:text-indigo-600 transition">
                Dashboard
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <a href="/cmsAdmin/website" className="hover:text-indigo-600 transition">
                Website
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-indigo-600 font-semibold">Manajemen Menu</span>
            </nav>

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layout className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                    Manajemen Menu
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Atur navigasi header, footer, dan struktur menu website
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/cmsAdmin/website/menu/tambah"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Menu
                </a>
                <a
                  href="/cmsAdmin/website/menu/pengaturan"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition text-sm font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </a>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                icon={<List className="w-5 h-5" />}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                label="Total Menu"
                value={totalMenus}
              />
              <StatCard
                icon={<Monitor className="w-5 h-5" />}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                label="Menu Header"
                value={headerCount}
              />
              <StatCard
                icon={<Footprints className="w-5 h-5" />}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
                label="Menu Footer"
                value={footerCount}
              />
              <StatCard
                icon={<CheckCircle className="w-5 h-5" />}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                label="Menu Aktif"
                value={activeCount}
              />
            </div>

            {/* SEARCH & FILTER */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="relative flex-1">
                <MenuIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer text-slate-700"
              >
                <option value="semua">Semua Tipe</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
              <button
                onClick={() => { setSearch(""); setFilterType("semua"); }}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Reset
              </button>
            </div>

            {/* MENU LIST - TABEL */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-10">
                        <GripVertical className="w-4 h-4 text-slate-300" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Judul Menu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        URL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMenus.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <MenuIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Tidak ada menu ditemukan</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMenus.map((menu) => (
                        <tr key={menu.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 text-sm">
                            {menu.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                              menu.type === "header"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-orange-100 text-orange-700"
                            }`}>
                              {menu.type === "header" ? <Monitor className="w-3 h-3" /> : <Footprints className="w-3 h-3" />}
                              {menu.type === "header" ? "Header" : "Footer"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-[150px]">
                            {menu.url}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                              menu.status === "aktif"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}>
                              {menu.status === "aktif" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {menu.status === "aktif" ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1.5">
                              <button className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition" title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TIPS */}
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-indigo-800">Tips Manajemen Menu</h4>
                <p className="text-xs sm:text-sm text-indigo-700/80 leading-relaxed mt-0.5">
                  Atur urutan menu dengan drag-and-drop, dan pastikan semua menu utama terlihat dengan baik di perangkat desktop maupun mobile.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
              © 2026 SmartSchool CMS. All rights reserved.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */
function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}