// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";

// import Sidebar from "@/app/components/Sidebar";
// import Header from "@/app/components/Header";
// import { apiFetch } from "../../../../../../lib/api";

// import {
//   ArrowLeft,
//   Menu,
//   Pencil,
//   Loader2,
//   AlertCircle,
//   Image as ImageIcon,
//   ExternalLink,
//   ArrowUpDown,
//   Calendar,
//   Hash,
// } from "lucide-react";

// const API_URL = "/api/cms/menu-konfigurasi";

// function unwrapData(result) {
//   let data = result?.data ?? result;
//   for (let i = 0; i < 3; i += 1) {
//     if (data && !Array.isArray(data) && typeof data === "object" && "data" in data) {
//       data = data.data;
//     } else break;
//   }
//   return data;
// }

// function getStatusLabel(status) {
//   const value = String(status || "").toLowerCase();
//   if (value === "aktif") return "Aktif";
//   if (value === "nonaktif") return "Nonaktif";
//   if (value === "draft") return "Draft";
//   return status || "-";
// }

// function getStatusStyle(status) {
//   const value = String(status || "").toLowerCase();
//   if (value === "aktif") return "theme-success border";
//   if (value === "draft") return "theme-warning border";
//   return "theme-card-soft theme-text-secondary border";
// }

// function formatLabel(value) {
//   return String(value || "-")
//     .replace(/[-_]/g, " ")
//     .replace(/\b\w/g, (l) => l.toUpperCase());
// }

// function formatDate(value) {
//   if (!value) return "-";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "-";
//   return d.toLocaleString("id-ID", {
//     day: "2-digit", month: "long", year: "numeric",
//     hour: "2-digit", minute: "2-digit",
//   });
// }

// export default function CmsMenuDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params?.id;

//   const [active, setActive] = useState("menu");
//   const [collapsed, setCollapsed] = useState(false);

//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchDetail = useCallback(async () => {
//     if (!id) return;
//     try {
//       setLoading(true);
//       setError("");
//       const result = await apiFetch(`${API_URL}/${id}`);
//       const data = unwrapData(result);
//       if (!data || (Array.isArray(data) && data.length === 0)) {
//         throw new Error("Konfigurasi menu tidak ditemukan.");
//       }
//       setItem(Array.isArray(data) ? data[0] : data);
//     } catch (err) {
//       setError(err?.message || "Gagal mengambil detail konfigurasi.");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchDetail();
//   }, [fetchDetail]);

//   // ================= LOADING =================
//   if (loading) {
//     return (
//       <div className="theme-page flex min-h-screen w-full">
//         <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
//         <div className="flex min-w-0 flex-1 flex-col">
//           <Header title="Detail Konfigurasi Menu" user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }} />
//           <main className="flex flex-1 items-center justify-center">
//             <div className="text-center">
//               <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />
//               <p className="theme-text text-sm font-semibold">Memuat detail konfigurasi...</p>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   // ================= ERROR =================
//   if (error || !item) {
//     return (
//       <div className="theme-page flex min-h-screen w-full">
//         <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
//         <div className="flex min-w-0 flex-1 flex-col">
//           <Header title="Detail Konfigurasi Menu" user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }} />
//           <main className="flex flex-1 items-center justify-center p-6">
//             <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-6 text-center">
//               <div className="theme-danger mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
//                 <AlertCircle className="h-6 w-6" />
//               </div>
//               <h2 className="theme-text mt-4 text-lg font-bold">Gagal Memuat Data</h2>
//               <p className="theme-text-secondary mt-2 text-sm">{error || "Data tidak ditemukan."}</p>
//               <div className="mt-5 flex justify-center gap-2">
//                 <button type="button" onClick={() => router.push("/admin/cms/menu")}
//                   className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold">
//                   Kembali
//                 </button>
//                 <button type="button" onClick={fetchDetail}
//                   className="theme-primary rounded-xl px-4 py-2.5 text-sm font-semibold">
//                   Coba Lagi
//                 </button>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   // ================= MAIN =================
//   return (
//     <div className="theme-page flex min-h-screen w-full">
//       <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
//       <div className="flex min-w-0 flex-1 flex-col">
//         <Header title="Detail Konfigurasi Menu" user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }} />

//         <main className="theme-page min-w-0 flex-1 overflow-y-auto">
//           <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 lg:px-9">

//             {/* HEADER ACTIONS */}
//             <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-center gap-3">
//                 <button type="button" onClick={() => router.push("/admin/cms/menu")}
//                   className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold">
//                   <ArrowLeft className="h-4 w-4" /> Kembali
//                 </button>
//                 <div>
//                   <h1 className="theme-text text-2xl font-bold">Detail Konfigurasi</h1>
//                   <p className="theme-text-secondary mt-1 text-sm">
//                     {formatLabel(item.halaman)} / {formatLabel(item.section)}
//                   </p>
//                 </div>
//               </div>

//               <button type="button" onClick={() => router.push(`/admin/cms/menu/${item.id}/edit`)}
//                 className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold">
//                 <Pencil className="h-4 w-4" /> Edit Konfigurasi
//               </button>
//             </div>

//             {/* IMAGE PREVIEW */}
//             {item.gambarUrl && (
//               <div className="theme-card theme-border mb-6 overflow-hidden rounded-2xl border">
//                 <img src={item.gambarUrl} alt={item.judul || "Gambar"}
//                   className="max-h-[380px] w-full object-cover"
//                   onError={(e) => { e.currentTarget.style.display = "none"; }} />
//               </div>
//             )}

//             {/* MAIN INFO */}
//             <section className="theme-card theme-border mb-6 rounded-2xl border p-5">
//               <div className="mb-4 flex items-center gap-3">
//                 <div className="theme-info flex h-11 w-11 items-center justify-center rounded-xl border">
//                   <Menu className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h2 className="theme-text text-lg font-bold">{item.judul || "Tanpa Judul"}</h2>
//                   {item.subJudul && <p className="theme-text-secondary mt-1 text-sm">{item.subJudul}</p>}
//                 </div>
//               </div>

//               <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
//                 <div className="theme-card-soft rounded-xl border p-4">
//                   <p className="theme-text-muted text-xs">Halaman</p>
//                   <p className="theme-text mt-2 text-sm font-semibold">{formatLabel(item.halaman)}</p>
//                 </div>
//                 <div className="theme-card-soft rounded-xl border p-4">
//                   <p className="theme-text-muted text-xs">Section</p>
//                   <p className="theme-text mt-2 text-sm font-semibold">{formatLabel(item.section)}</p>
//                 </div>
//                 <div className="theme-card-soft rounded-xl border p-4">
//                   <p className="theme-text-muted text-xs">Urutan</p>
//                   <p className="theme-text mt-2 inline-flex items-center gap-2 text-sm font-semibold">
//                     <ArrowUpDown className="h-3.5 w-3.5" /> {item.urutan ?? 1}
//                   </p>
//                 </div>
//                 <div className="theme-card-soft rounded-xl border p-4">
//                   <p className="theme-text-muted text-xs">Status</p>
//                   <span className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(item.status)}`}>
//                     {getStatusLabel(item.status)}
//                   </span>
//                 </div>
//               </div>
//             </section>

//             {/* KONTEN */}
//             <section className="theme-card theme-border mb-6 rounded-2xl border p-5">
//               <h3 className="theme-text mb-3 text-sm font-bold">Konten</h3>
//               <div className="theme-card-soft theme-border rounded-xl border p-4">
//                 <p className="theme-text-secondary whitespace-pre-wrap break-words text-sm leading-7">
//                   {item.konten || "Belum ada konten."}
//                 </p>
//               </div>
//             </section>

//             {/* CTA */}
//             {(item.ctaText || item.ctaLink) && (
//               <section className="theme-card theme-border mb-6 rounded-2xl border p-5">
//                 <h3 className="theme-text mb-3 text-sm font-bold">Tombol CTA</h3>
//                 <div className="theme-card-soft rounded-xl border p-4">
//                   <p className="theme-text text-sm font-semibold">{item.ctaText || "Tanpa teks tombol"}</p>
//                   {item.ctaLink && (
//                     <a href={item.ctaLink} target="_blank" rel="noopener noreferrer"
//                       className="theme-text-secondary mt-2 inline-flex items-center gap-1 break-all text-xs hover:text-[var(--color-primary)]">
//                       <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {item.ctaLink}
//                     </a>
//                   )}
//                 </div>
//               </section>
//             )}

//             {/* META */}
//             <section className="theme-card theme-border mb-6 rounded-2xl border p-5">
//               <h3 className="theme-text mb-3 text-sm font-bold">Informasi Tambahan</h3>
//               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                 <div className="theme-card-soft flex items-center gap-3 rounded-xl border p-4">
//                   <Hash className="theme-text-muted h-4 w-4" />
//                   <div>
//                     <p className="theme-text-muted text-xs">ID</p>
//                     <p className="theme-text text-sm font-semibold">{item.id ?? "-"}</p>
//                   </div>
//                 </div>
//                 <div className="theme-card-soft flex items-center gap-3 rounded-xl border p-4">
//                   <Calendar className="theme-text-muted h-4 w-4" />
//                   <div>
//                     <p className="theme-text-muted text-xs">Dibuat</p>
//                     <p className="theme-text text-sm font-semibold">{formatDate(item.createdAt || item.created_at)}</p>
//                   </div>
//                 </div>
//                 <div className="theme-card-soft flex items-center gap-3 rounded-xl border p-4">
//                   <Calendar className="theme-text-muted h-4 w-4" />
//                   <div>
//                     <p className="theme-text-muted text-xs">Diperbarui</p>
//                     <p className="theme-text text-sm font-semibold">{formatDate(item.updatedAt || item.updated_at)}</p>
//                   </div>
//                 </div>
//                 <div className="theme-card-soft flex items-center gap-3 rounded-xl border p-4">
//                   <ImageIcon className="theme-text-muted h-4 w-4" />
//                   <div className="min-w-0">
//                     <p className="theme-text-muted text-xs">Gambar</p>
//                     <p className="theme-text truncate text-sm font-semibold">{item.gambarUrl ? "Tersedia" : "Tidak ada"}</p>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             <footer className="py-7 text-center">
//               <p className="theme-text-muted text-xs">© 2026 SmartSchool • CMS Management</p>
//             </footer>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }