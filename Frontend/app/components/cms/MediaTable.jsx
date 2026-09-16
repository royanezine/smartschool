// app/cmsAdmin/components/MediaTable.jsx

"use client";

import { useState } from "react";
import { 
  Trash2, 
  Download, 
  File, 
  Image, 
  FileText, 
  FolderOpen, 
  Eye, 
  LayoutGrid, 
  List,
  X
} from "lucide-react";

const MediaTable = ({ media: initialMedia }) => {
  const [media, setMedia] = useState(initialMedia);
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setMedia(media.filter((item) => item.id !== id));
  };

  // Peta Warna Tipe File (Premium & Kalem)
  const typeConfig = {
    image: { icon: Image, label: "Gambar", color: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50" },
    pdf: { icon: FileText, label: "PDF", color: "bg-rose-50 text-rose-600 ring-1 ring-rose-200/50" },
    video: { icon: FileText, label: "Video", color: "bg-violet-50 text-violet-600 ring-1 ring-violet-200/50" },
    default: { icon: File, label: "File", color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/50" },
  };

  const getFileType = (type) => {
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf") return "pdf";
    if (type.startsWith("video/")) return "video";
    return "default";
  };

  const formatFileSize = (size) => {
    if (!size) return "-";
    const num = parseFloat(size);
    if (size.includes("MB")) return size;
    if (size.includes("KB")) return size;
    if (num > 1024 * 1024) return (num / (1024 * 1024)).toFixed(1) + " MB";
    if (num > 1024) return (num / 1024).toFixed(1) + " KB";
    return size;
  };

  // EMPTY STATE (Minimalis & Elegan)
  if (media.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <File className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Belum ada file media</h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
          Upload file gambar, PDF, atau video pertama Anda ke manajemen media.
        </p>
      </div>
    );
  }

  // View Toggle Component
  const ViewToggle = () => (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
      <button
        onClick={() => setViewMode("grid")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "grid"
            ? "bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200/50 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" /> Grid
      </button>
      <button
        onClick={() => setViewMode("table")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          viewMode === "table"
            ? "bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200/50 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <List className="w-3.5 h-3.5" /> List
      </button>
    </div>
  );

  // --- MODE GRID (Premium & Clean) ---
  if (viewMode === "grid") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            Total <span className="text-slate-700">{media.length}</span> file
          </p>
          <ViewToggle />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {media.map((item) => {
            const typeKey = getFileType(item.type);
            const TypeIcon = typeConfig[typeKey].icon;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200/70 transition-all duration-200 overflow-hidden"
              >
                {/* Thumbnail Wrapper */}
                <div className="relative aspect-square bg-slate-50/80 overflow-hidden">
                  {item.type.startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TypeIcon className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
                    </div>
                  )}

                  {/* Aksi Overlay (Modern: Ringan & Blur) */}
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:shadow-md text-slate-700 hover:text-indigo-600 transition-all"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={item.url}
                      download
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:shadow-md text-slate-700 hover:text-blue-600 transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:shadow-md text-slate-700 hover:text-red-600 transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badge Folder di atas Thumbnail */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-full text-[9px] font-medium text-slate-600 border border-slate-200/60 shadow-sm">
                    {item.folder}
                  </div>
                </div>

                {/* Konten Kartu */}
                <div className="p-3 border-t border-slate-100 flex-1 flex flex-col justify-between">
                  <p className="text-sm font-medium text-slate-800 truncate leading-tight" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span className="font-medium">{formatFileSize(item.size)}</span>
                    <span className={`px-2 py-0.5 rounded-full ${typeConfig[typeKey].color}`}>
                      {typeConfig[typeKey].label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- MODE TABEL (Profesional & Bersih) ---
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      {/* Header Tabel + Toggle */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            Total <span className="font-semibold text-slate-700">{media.length}</span> file
          </span>
        </div>
        <ViewToggle />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/60 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 w-[40%] md:w-[35%]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">File</span>
              </th>
              <th className="px-5 py-3 hidden md:table-cell w-[15%]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tipe</span>
              </th>
              <th className="px-5 py-3 hidden lg:table-cell w-[15%]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Ukuran</span>
              </th>
              <th className="px-5 py-3 hidden lg:table-cell w-[15%]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Folder</span>
              </th>
              <th className="px-5 py-3 w-[15%] text-right">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {media.map((item) => {
              const typeKey = getFileType(item.type);
              const TypeIcon = typeConfig[typeKey].icon;

              return (
                <tr
                  key={item.id}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  {/* Kolom File */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        {item.type.startsWith("image/") ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                          {item.name}
                        </p>
                        {/* Info di Mobile */}
                        <div className="flex items-center gap-2 mt-0.5 md:hidden flex-wrap">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeConfig[typeKey].color}`}>
                            {typeConfig[typeKey].label}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatFileSize(item.size)}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tipe (Desktop) */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full ${typeConfig[typeKey].color}`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeConfig[typeKey].label}
                    </span>
                  </td>

                  {/* Ukuran (Desktop) */}
                  <td className="px-5 py-3.5 hidden lg:table-cell text-xs font-medium text-slate-500">
                    {formatFileSize(item.size)}
                  </td>

                  {/* Folder (Desktop) */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <FolderOpen className="w-3 h-3 text-slate-400" />
                      {item.folder}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Lihat"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={item.url}
                        download
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Data (Opsional) */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end">
        <span className="text-[10px] font-medium text-slate-400 bg-slate-100/80 px-3 py-1 rounded-full">
          Data simulasi (Dummy)
        </span>
      </div>
    </div>
  );
};

export default MediaTable;