// app/cmsAdmin/components/BannerTable.jsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Pencil, 
  Trash2, 
  Eye, 
  Image, 
  LayoutPanelTop, 
  Check, 
  X as XIcon,
  LayoutGrid
} from "lucide-react";

const BannerTable = ({ banners: initialBanners }) => {
  const [banners, setBanners] = useState(initialBanners);

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setBanners(banners.filter((banner) => banner.id !== id));
  };

  // Warna badge posisi
  const positionColors = {
    'hero': 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/50',
    'promo': 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/50',
    'news': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50',
    'default': 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/50'
  };

  // EMPTY STATE
  if (banners.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <LayoutPanelTop className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Belum ada banner</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Tambahkan banner pertama Anda untuk tampilan website yang lebih menarik. Pastikan gambar memiliki rasio yang tepat.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
      
      {/* DESKTOP & TABLET TABLE VIEW */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3.5 w-[20%]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gambar</span>
              </th>
              <th className="px-6 py-3.5 w-[30%]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Judul</span>
              </th>
              <th className="px-6 py-3.5 w-[20%] hidden md:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Posisi</span>
              </th>
              <th className="px-6 py-3.5 w-[15%] hidden lg:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              </th>
              <th className="px-6 py-3.5 w-[15%] text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {banners.map((banner) => (
              <tr 
                key={banner.id} 
                className="group transition-colors hover:bg-slate-50/80"
              >
                {/* Gambar Thumbnail */}
                <td className="px-6 py-4">
                  <div className="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>

                {/* Judul */}
                <td className="px-6 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {banner.title}
                    </p>
                    {/* Info singkat untuk tampilan tablet/small */}
                    <div className="flex items-center gap-2 mt-1 md:hidden flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        banner.status === "active"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          banner.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                        }`} />
                        {banner.status === "active" ? "Active" : "Draft"}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                        {banner.position}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Posisi - Desktop */}
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    positionColors[banner.position.toLowerCase()] || positionColors.default
                  }`}>
                    <LayoutPanelTop className="w-3 h-3" />
                    {banner.position}
                  </span>
                </td>

                {/* Status - Desktop */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    banner.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      banner.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                    }`} />
                    {banner.status === "active" ? "Active" : "Draft"}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/cmsAdmin/banners/${banner.id}/preview`}
                      target="_blank"
                      className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/cmsAdmin/banners/${banner.id}/edit`}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE - CARD LIST VIEW */}
      <div className="sm:hidden divide-y divide-slate-100">
        {banners.map((banner) => (
          <div key={banner.id} className="p-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start gap-3">
              {/* Gambar Thumbnail */}
              <div className="flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mt-0.5">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {banner.title}
                </p>
                
                {/* Info Row Mobile */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    banner.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      banner.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                    }`} />
                    {banner.status === "active" ? "Active" : "Draft"}
                  </span>
                  
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                    positionColors[banner.position.toLowerCase()] || positionColors.default
                  }`}>
                    {banner.position}
                  </span>
                </div>
              </div>

              {/* Aksi Mobile */}
              <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                <Link href={`/cmsAdmin/banners/${banner.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER - Ringkasan Data */}
      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            Total <span className="font-medium text-slate-700">{banners.length}</span>
          </span>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {banners.filter(b => b.status === "active").length}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {banners.filter(b => b.status === "draft").length}
            </span>
          </div>
        </div>
        
        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Data simulasi (Dummy)
        </span>
      </div>
    </div>
  );
};

export default BannerTable;