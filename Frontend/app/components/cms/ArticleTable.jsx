// app/components/cms/ArticleTable.jsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2, Eye, FileText, Calendar, Tag, LayoutGrid } from "lucide-react";

const ArticleTable = ({ articles: initialArticles }) => {
  const [articles, setArticles] = useState(initialArticles);

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setArticles(articles.filter((article) => article.id !== id));
  };

  // EMPTY STATE
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Belum ada artikel</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Mulai buat artikel pertama Anda untuk mengisi konten website. Artikel yang diterbitkan akan langsung tampil.
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
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <th className="px-6 py-3.5 w-[35%] md:w-[30%]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Judul</span>
              </th>
              <th className="px-6 py-3.5 w-[15%] hidden md:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              </th>
              <th className="px-6 py-3.5 w-[20%] hidden lg:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</span>
              </th>
              <th className="px-6 py-3.5 w-[20%] hidden xl:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dibuat</span>
              </th>
              <th className="px-6 py-3.5 w-[20%] text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((article) => (
              <tr 
                key={article.id} 
                className="group transition-colors hover:bg-slate-50/80"
              >
                {/* Judul */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar Inisial Premium */}
                    <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shadow-sm ring-1 ring-indigo-100">
                      {article.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {article.title}
                      </p>
                      {/* Info singkat untuk tampilan tablet/small */}
                      <div className="flex items-center gap-2 mt-1 md:hidden flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          article.status === "published"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            article.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                          }`} />
                          {article.status === "published" ? "Published" : "Draft"}
                        </span>
                        {article.category && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                            {article.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status - Desktop */}
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    article.status === "published"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      article.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                    }`} />
                    {article.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>

                {/* Kategori - Desktop */}
                <td className="px-6 py-4 hidden lg:table-cell">
                  {article.category ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-full truncate max-w-[150px]">
                      <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{article.category}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>

                {/* Tanggal - Desktop */}
                <td className="px-6 py-4 hidden xl:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {new Date(article.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>

                {/* Action Buttons */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {article.status === "published" && (
                      <Link
                        href={`/preview/${article.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/cmsAdmin/articles/${article.id}/edit`}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
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
        {articles.map((article) => (
          <div key={article.id} className="p-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Avatar Inisial */}
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold shadow-sm ring-1 ring-indigo-100 mt-0.5">
                  {article.title.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {article.title}
                  </p>
                  
                  {/* Info Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      article.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        article.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      {article.status === "published" ? "Published" : "Draft"}
                    </span>
                    
                    {article.category && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[100px] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-400" /> {article.category}
                      </span>
                    )}
                    
                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" /> 
                      {new Date(article.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aksi Mobile */}
              <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                {article.status === "published" && (
                  <Link href={`/preview/${article.slug}`} target="_blank" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                )}
                <Link href={`/cmsAdmin/articles/${article.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(article.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
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
            Total <span className="font-medium text-slate-700">{articles.length}</span>
          </span>
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {articles.filter(a => a.status === "published").length}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {articles.filter(a => a.status === "draft").length}
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

export default ArticleTable;