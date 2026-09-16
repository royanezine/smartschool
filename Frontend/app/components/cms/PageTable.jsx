// app/cmsAdmin/components/PageTable.jsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2, FileText, Calendar, Home } from "lucide-react";

const PageTable = ({ pages: initialPages }) => {
  const [pages, setPages] = useState(initialPages);

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus halaman ini?")) return;
    setPages(pages.filter((page) => page.id !== id));
  };

  if (pages.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-600">Belum ada halaman statis</h3>
        <p className="text-xs text-gray-400 mt-1">Mulai buat halaman pertama Anda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table untuk desktop & tablet */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/80">
              <th className="px-5 py-3.5 text-left">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Judul</span>
              </th>
              <th className="px-5 py-3.5 text-left">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Slug</span>
              </th>
              <th className="px-5 py-3.5 text-left hidden md:table-cell">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Homepage</span>
              </th>
              <th className="px-5 py-3.5 text-left hidden lg:table-cell">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Dibuat</span>
              </th>
              <th className="px-5 py-3.5 text-right">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pages.map((page) => (
              <tr
                key={page.id}
                className="group transition-all duration-200 hover:bg-blue-50/40"
              >
                {/* Judul */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs">
                      {page.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {page.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                        {page.is_homepage && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                            <Home className="w-3 h-3" />
                            Homepage
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">/{page.slug}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Slug - Desktop */}
                <td className="px-5 py-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-500 font-mono">/{page.slug}</span>
                </td>

                {/* Homepage - Desktop */}
                <td className="px-5 py-4 hidden md:table-cell">
                  {page.is_homepage ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      <Home className="w-3.5 h-3.5" />
                      Homepage
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>

                {/* Tanggal - Desktop */}
                <td className="px-5 py-4 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(page.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/cmsAdmin/pages/${page.id}/edit`}
                      className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card View */}
      <div className="sm:hidden divide-y divide-gray-100">
        {pages.map((page) => (
          <div key={page.id} className="px-4 py-4 hover:bg-purple-50/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-semibold text-xs">
                  {page.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{page.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {page.is_homepage && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                        <Home className="w-3 h-3" />
                        Homepage
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      /{page.slug}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(page.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 ml-2">
                <Link href={`/cmsAdmin/pages/${page.id}/edit`} className="p-1.5 text-gray-400 hover:text-purple-600">
                  <Pencil size={14} />
                </Link>
                <button onClick={() => handleDelete(page.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Total <span className="font-medium text-gray-600">{pages.length}</span> halaman</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Homepage <span className="font-medium text-indigo-600">{pages.filter(p => p.is_homepage).length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full">⚡ Dummy</span>
        </div>
      </div>
    </div>
  );
};

export default PageTable;